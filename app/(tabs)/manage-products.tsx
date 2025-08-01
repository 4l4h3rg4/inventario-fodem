import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { FodemLogo } from '../../src/presentation/components/FodemLogo';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { getShadowStyle } from '../../src/shared/utils/styles';
import { Icon } from '../../src/presentation/components/Icon';
import { useAuth } from '../../src/shared/contexts/AuthContext';
import { HouseholdService } from '../../src/shared/services/householdService';
import { ProductService, Product, CreateProductData } from '../../src/shared/services/productService';

export default function ManageProductsScreen() {
  const { user } = useAuth();
  const [currentHousehold, setCurrentHousehold] = useState<any>(null);
  const [userHouseholds, setUserHouseholds] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductData, setEditProductData] = useState<CreateProductData>({
    name: '',
    current_stock: 0,
    min_recommended: 1,
    ideal_amount: 2,
    household_id: '',
  });

  useEffect(() => {
    loadUserHouseholds();
  }, []);

  useEffect(() => {
    if (currentHousehold) {
      loadProducts();
    }
  }, [currentHousehold]);

  const loadUserHouseholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await HouseholdService.getUserHouseholds();
      
      if (error) {
        console.error('Error loading households:', error);
        return;
      }

      if (data && data.length > 0) {
        setUserHouseholds(data);
        setCurrentHousehold(data[0]);
      }
    } catch (error) {
      console.error('Error loading households:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!currentHousehold) return;
    
    try {
      const { data, error } = await ProductService.getHouseholdProducts(currentHousehold.id);
      
      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name,
      current_stock: product.current_stock,
      min_recommended: product.min_recommended,
      ideal_amount: product.ideal_amount,
      household_id: product.household_id,
    });
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !editProductData.name.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const { success, error } = await ProductService.updateProduct({
        product_id: editingProduct.id,
        name: editProductData.name,
        current_stock: editProductData.current_stock,
        min_recommended: editProductData.min_recommended,
        ideal_amount: editProductData.ideal_amount,
      });

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (success) {
        setShowEditProductModal(false);
        setEditingProduct(null);
        loadProducts(); // Recargar productos
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      const { success, error } = await ProductService.deleteProduct(productToDelete.id);
      
      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (success) {
        loadProducts(); // Recargar productos
        Alert.alert('Éxito', 'Producto eliminado correctamente');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto');
    } finally {
      setShowDeleteConfirmModal(false);
      setProductToDelete(null);
    }
  };

  const cancelDeleteProduct = () => {
    setShowDeleteConfirmModal(false);
    setProductToDelete(null);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: FODEM_COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <FodemLogo size="large" showSubtitle={true} />
        <Text style={{ 
          fontSize: 18, 
          color: FODEM_COLORS.textSecondary, 
          marginTop: 20, 
          textAlign: 'center' 
        }}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{
      flex: 1,
      backgroundColor: FODEM_COLORS.background,
    }}>
      <View style={{
        padding: 20,
        paddingTop: Platform.OS === 'web' ? 20 : 60,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 40,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                marginRight: 16,
                padding: 8,
                borderRadius: 8,
                backgroundColor: FODEM_COLORS.surface,
              }}
              onPress={handleGoBack}
            >
              <Icon name="back" size={24} color={FODEM_COLORS.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: FODEM_COLORS.textPrimary,
              }}>
                Gestionar Productos
              </Text>
              <Text style={{
                fontSize: 14,
                color: FODEM_COLORS.textSecondary,
              }}>
                Editar y eliminar productos
              </Text>
            </View>
          </View>
        </View>

        {/* Selector de Hogar */}
        {currentHousehold && (
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            ...getShadowStyle(),
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="household" size={20} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginLeft: 8,
                }}>
                  {currentHousehold.name}
                </Text>
              </View>
              
              <TouchableOpacity
                style={{
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                onPress={() => setShowHouseholdSelector(true)}
              >
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Cambiar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Lista de Productos */}
        <View style={{
          backgroundColor: FODEM_COLORS.surface,
          borderRadius: 16,
          padding: 20,
          ...getShadowStyle(),
        }}>
                     <View style={{
             flexDirection: 'row',
             alignItems: 'center',
             marginBottom: 20,
           }}>
             <Icon name="package" size={20} color={FODEM_COLORS.textPrimary} />
             <Text style={{
               fontSize: 18,
               fontWeight: '600',
               color: FODEM_COLORS.textPrimary,
               marginLeft: 8,
             }}>
               Productos ({products.length})
             </Text>
           </View>

          {products.length > 0 ? (
            <View style={{ gap: 12 }}>
              {products.map((product) => (
                <View key={product.id} style={{
                  backgroundColor: FODEM_COLORS.background,
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: FODEM_COLORS.border,
                }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: FODEM_COLORS.textPrimary,
                      flex: 1,
                    }}>
                      {product.name}
                    </Text>
                    
                    <View style={{
                      flexDirection: 'row',
                      gap: 8,
                    }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: FODEM_COLORS.primary,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                        }}
                        onPress={() => handleEditProduct(product)}
                      >
                        <Text style={{
                          color: FODEM_COLORS.textLight,
                          fontSize: 12,
                          fontWeight: '600',
                        }}>
                          Editar
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={{
                          backgroundColor: FODEM_COLORS.error,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          minWidth: 60,
                          minHeight: 30,
                        }}
                        activeOpacity={0.7}
                        onPress={() => handleDeleteProduct(product)}
                      >
                        <Text style={{
                          color: FODEM_COLORS.textLight,
                          fontSize: 12,
                          fontWeight: '600',
                        }}>
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    gap: 16,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.textSecondary,
                        marginBottom: 4,
                      }}>
                        Stock Actual
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: FODEM_COLORS.textPrimary,
                      }}>
                        {product.current_stock}
                      </Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.textSecondary,
                        marginBottom: 4,
                      }}>
                        Mínimo
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: FODEM_COLORS.textPrimary,
                      }}>
                        {product.min_recommended}
                      </Text>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.textSecondary,
                        marginBottom: 4,
                      }}>
                        Ideal
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: FODEM_COLORS.textPrimary,
                      }}>
                        {product.ideal_amount}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
                         <View style={{
               alignItems: 'center',
               paddingVertical: 40,
             }}>
               <Icon name="package" size={48} color={FODEM_COLORS.border} />
               <Text style={{
                 fontSize: 18,
                 fontWeight: '600',
                 marginBottom: 8,
                 marginTop: 16,
                 color: FODEM_COLORS.textPrimary,
                 textAlign: 'center',
               }}>
                 No hay productos
               </Text>
              <Text style={{
                fontSize: 14,
                color: FODEM_COLORS.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}>
                Agrega productos desde la pantalla principal para poder gestionarlos aquí.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Modal Selector de Hogar */}
      <Modal
        visible={showHouseholdSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHouseholdSelector(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            ...getShadowStyle(),
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Seleccionar Hogar
            </Text>
            
            <View style={{ gap: 12 }}>
              {userHouseholds.map((household) => (
                <TouchableOpacity
                  key={household.id}
                  style={{
                    backgroundColor: currentHousehold?.id === household.id ? FODEM_COLORS.primary : FODEM_COLORS.background,
                    padding: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: FODEM_COLORS.border,
                  }}
                  onPress={() => {
                    setCurrentHousehold(household);
                    setShowHouseholdSelector(false);
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: currentHousehold?.id === household.id ? FODEM_COLORS.textLight : FODEM_COLORS.textPrimary,
                  }}>
                    {household.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: FODEM_COLORS.secondary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 20,
              }}
              onPress={() => setShowHouseholdSelector(false)}
            >
              <Text style={{
                color: FODEM_COLORS.textPrimary,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal
        visible={showEditProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditProductModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            ...getShadowStyle(),
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Editar Producto
            </Text>
            
            <View style={{ gap: 16, marginBottom: 20 }}>
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: FODEM_COLORS.textPrimary,
                  marginBottom: 8,
                }}>
                  Nombre del producto
                </Text>
                <TextInput
                  style={{
                    backgroundColor: FODEM_COLORS.background,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: FODEM_COLORS.border,
                    color: FODEM_COLORS.textPrimary,
                  }}
                  value={editProductData.name}
                  onChangeText={(text) => setEditProductData({...editProductData, name: text})}
                  placeholder="Nombre del producto"
                  placeholderTextColor={FODEM_COLORS.textSecondary}
                />
              </View>

              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: FODEM_COLORS.textPrimary,
                  marginBottom: 8,
                }}>
                  Stock actual
                </Text>
                <TextInput
                  style={{
                    backgroundColor: FODEM_COLORS.background,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: FODEM_COLORS.border,
                    color: FODEM_COLORS.textPrimary,
                  }}
                  value={editProductData.current_stock?.toString()}
                  onChangeText={(text) => setEditProductData({...editProductData, current_stock: parseInt(text) || 0})}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={FODEM_COLORS.textSecondary}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: FODEM_COLORS.textPrimary,
                    marginBottom: 8,
                  }}>
                    Mínimo recomendado
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: FODEM_COLORS.background,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: FODEM_COLORS.border,
                      color: FODEM_COLORS.textPrimary,
                    }}
                    value={editProductData.min_recommended?.toString()}
                    onChangeText={(text) => setEditProductData({...editProductData, min_recommended: parseInt(text) || 1})}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={FODEM_COLORS.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: FODEM_COLORS.textPrimary,
                    marginBottom: 8,
                  }}>
                    Cantidad ideal
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: FODEM_COLORS.background,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: FODEM_COLORS.border,
                      color: FODEM_COLORS.textPrimary,
                    }}
                    value={editProductData.ideal_amount?.toString()}
                    onChangeText={(text) => setEditProductData({...editProductData, ideal_amount: parseInt(text) || 2})}
                    keyboardType="numeric"
                    placeholder="2"
                    placeholderTextColor={FODEM_COLORS.textSecondary}
                  />
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setShowEditProductModal(false)}
              >
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleUpdateProduct}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Actualizar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
                 </View>
       </Modal>

       {/* Modal Confirmación Eliminar Producto */}
       <Modal
         visible={showDeleteConfirmModal}
         transparent={true}
         animationType="slide"
         onRequestClose={cancelDeleteProduct}
       >
         <View style={{
           flex: 1,
           backgroundColor: 'rgba(0,0,0,0.5)',
           justifyContent: 'center',
           alignItems: 'center',
           padding: 20,
         }}>
           <View style={{
             backgroundColor: FODEM_COLORS.surface,
             borderRadius: 16,
             padding: 24,
             width: '100%',
             maxWidth: 400,
             ...getShadowStyle(),
           }}>
             <Text style={{
               fontSize: 20,
               fontWeight: '600',
               color: FODEM_COLORS.textPrimary,
               marginBottom: 8,
               textAlign: 'center',
             }}>
               Eliminar Producto
             </Text>
             
             <Text style={{
               fontSize: 16,
               color: FODEM_COLORS.textSecondary,
               marginBottom: 24,
               textAlign: 'center',
               lineHeight: 22,
             }}>
               ¿Estás seguro de que quieres eliminar "{productToDelete?.name}"? Esta acción no se puede deshacer.
             </Text>

             <View style={{ flexDirection: 'row', gap: 12 }}>
               <TouchableOpacity
                 style={{
                   flex: 1,
                   backgroundColor: FODEM_COLORS.secondary,
                   paddingVertical: 12,
                   borderRadius: 8,
                   alignItems: 'center',
                 }}
                 onPress={cancelDeleteProduct}
               >
                 <Text style={{
                   color: FODEM_COLORS.textPrimary,
                   fontSize: 16,
                   fontWeight: '600',
                 }}>
                   Cancelar
                 </Text>
               </TouchableOpacity>
               <TouchableOpacity
                 style={{
                   flex: 1,
                   backgroundColor: FODEM_COLORS.error,
                   paddingVertical: 12,
                   borderRadius: 8,
                   alignItems: 'center',
                 }}
                 onPress={confirmDeleteProduct}
               >
                 <Text style={{
                   color: FODEM_COLORS.textLight,
                   fontSize: 16,
                   fontWeight: '600',
                 }}>
                   Eliminar
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>
     </ScrollView>
   );
 } 