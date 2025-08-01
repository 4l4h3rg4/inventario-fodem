import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Link, router } from 'expo-router';
import { Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { FodemLogo } from '../../src/presentation/components/FodemLogo';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { getShadowStyle } from '../../src/shared/utils/styles';
import { Icon } from '../../src/presentation/components/Icon';
import { useAuth } from '../../src/shared/contexts/AuthContext';
import { useHousehold } from '../../src/shared/contexts/HouseholdContext';
import { ProductService, Product, CreateProductData } from '../../src/shared/services/productService';

export default function InventoryScreen() {
  const { user } = useAuth();
  const { 
    currentHousehold, 
    userHouseholds, 
    loading: householdsLoading,
    setCurrentHousehold,
    refreshHouseholds 
  } = useHousehold();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'shopping'>('stock');
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState<CreateProductData>({
    name: '',
    current_stock: 0,
    min_recommended: 1,
    ideal_amount: 2,
    household_id: '',
  });
  const [productsLoading, setProductsLoading] = useState(false);
  const [customPurchaseProduct, setCustomPurchaseProduct] = useState<Product | null>(null);
  const [customPurchaseAmount, setCustomPurchaseAmount] = useState('');
  const [showCustomPurchaseInput, setShowCustomPurchaseInput] = useState(false);

  useEffect(() => {
    if (currentHousehold) {
      loadProducts();
    }
  }, [currentHousehold]);

  // El contexto ya maneja la carga de hogares automáticamente

  const loadProducts = async () => {
    if (!currentHousehold || productsLoading) return;
    
    try {
      setProductsLoading(true);
      const { data, error } = await ProductService.getHouseholdProducts(currentHousehold.id);
      
      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name.trim() || !currentHousehold) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const productData: CreateProductData = {
        ...newProduct,
        household_id: currentHousehold.id,
      };

      const { data, error } = await ProductService.createProduct(productData);
      
      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (data) {
        setProducts([...products, data]);
        setShowAddProductModal(false);
        setNewProduct({
          name: '',
          current_stock: 0,
          min_recommended: 1,
          ideal_amount: 2,
          household_id: '',
        });
        Alert.alert('Éxito', 'Producto creado correctamente');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      Alert.alert('Error', 'No se pudo crear el producto');
    }
  };

  // Función para recargar hogares (se puede llamar desde otras páginas)
  // refreshHouseholds ya está disponible desde el contexto

  const handleUpdateStock = async (product: Product, changeAmount: number) => {
    try {
      // Actualizar el estado local inmediatamente para feedback instantáneo
      const updatedProducts = products.map(p => 
        p.id === product.id 
          ? { ...p, current_stock: p.current_stock + changeAmount }
          : p
      );
      setProducts(updatedProducts);

      // Luego actualizar en la base de datos
      const { success, error } = await ProductService.updateProductStock({
        product_id: product.id,
        change_amount: changeAmount,
        change_type: changeAmount > 0 ? 'add' : 'remove',
      });

      if (error) {
        // Si hay error, revertir el cambio local
        setProducts(products);
        Alert.alert('Error', error);
        return;
      }

      // Si todo va bien, no necesitamos recargar productos
      console.log('Stock actualizado exitosamente');
    } catch (error) {
      // Si hay error, revertir el cambio local
      setProducts(products);
      console.error('Error updating stock:', error);
      Alert.alert('Error', 'No se pudo actualizar el stock');
    }
  };

  const handleCustomPurchase = (product: Product) => {
    setCustomPurchaseProduct(product);
    setCustomPurchaseAmount('');
    setShowCustomPurchaseInput(true);
  };

  const handleConfirmCustomPurchase = async () => {
    if (!customPurchaseProduct || !customPurchaseAmount.trim()) {
      Alert.alert('Error', 'Por favor ingresa una cantidad válida');
      return;
    }

    const amount = parseInt(customPurchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido mayor a 0');
      return;
    }

    await handleUpdateStock(customPurchaseProduct, amount);
    setShowCustomPurchaseInput(false);
    setCustomPurchaseProduct(null);
    setCustomPurchaseAmount('');
  };

  const handleCancelCustomPurchase = () => {
    setShowCustomPurchaseInput(false);
    setCustomPurchaseProduct(null);
    setCustomPurchaseAmount('');
  };

  const handleSettings = () => {
    router.push('/(tabs)/profile');
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.current_stock <= product.min_recommended);
  };

  const getShoppingList = () => {
    return products.filter(product => product.current_stock < product.ideal_amount);
  };

  if (householdsLoading) {
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
        {/* Header con logo */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 40,
        }}>
          <FodemLogo size="small" showSubtitle={false} />

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
                          <TouchableOpacity
                style={{
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => router.push('/(tabs)/manage-products')}
              >
                <Icon name="edit" size={16} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 14,
                  fontWeight: '600',
                  marginLeft: 6,
                }}>
                  Gestionar
                </Text>
              </TouchableOpacity>
            
            {currentHousehold && (
            <TouchableOpacity
              style={{
                backgroundColor: FODEM_COLORS.secondary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
              onPress={() => setShowHouseholdSelector(true)}
            >
                <Text style={{ fontSize: 16 }}>{currentHousehold.description}</Text>
              <Text style={{
                color: FODEM_COLORS.textPrimary,
                fontSize: 14,
                fontWeight: '500',
              }}>
                {currentHousehold.name}
              </Text>
                <Icon name="dropdown" size={12} color={FODEM_COLORS.textPrimary} />
            </TouchableOpacity>
            )}

            {/* Solo mostrar botón de ajustes en web */}
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: FODEM_COLORS.surface,
                }}
                onPress={handleSettings}
              >
                <Icon name="settings" size={20} color={FODEM_COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenido principal */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: 16,
            color: FODEM_COLORS.textPrimary,
            textAlign: 'center',
          }}>
            Mi Despensa
          </Text>

          <Text style={{
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 40,
            color: FODEM_COLORS.textSecondary,
            lineHeight: 24,
          }}>
            Gestiona el stock de productos en tu despensa
          </Text>

          <TouchableOpacity 
            style={{
              backgroundColor: FODEM_COLORS.primary,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 20,
              minWidth: 200,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
            onPress={() => setShowAddProductModal(true)}
          >
              <Icon name="add" size={18} color={FODEM_COLORS.textLight} />
              <Text style={{
                color: FODEM_COLORS.textLight,
                fontSize: 18,
                fontWeight: '600',
              }}>
                Agregar Producto
              </Text>
            </TouchableOpacity>
        </View>

        {/* Tarjeta principal */}
        <View style={{
          backgroundColor: FODEM_COLORS.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          ...getShadowStyle(),
        }}>
          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: FODEM_COLORS.border,
          }}>
            <TouchableOpacity 
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 2,
                borderBottomColor: activeTab === 'stock' ? FODEM_COLORS.primary : 'transparent',
              marginRight: 24,
              }}
              onPress={() => setActiveTab('stock')}
            >
              <Icon name="inventory" size={16} color={activeTab === 'stock' ? FODEM_COLORS.primary : FODEM_COLORS.textSecondary} />
              <Text style={{
                color: activeTab === 'stock' ? FODEM_COLORS.primary : FODEM_COLORS.textSecondary,
                fontSize: 16,
                fontWeight: activeTab === 'stock' ? '600' : '500',
                marginLeft: 6,
              }}>
                Stock ({products.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === 'shopping' ? FODEM_COLORS.primary : 'transparent',
              }}
              onPress={() => setActiveTab('shopping')}
            >
              <Icon name="shopping" size={16} color={activeTab === 'shopping' ? FODEM_COLORS.primary : FODEM_COLORS.textSecondary} />
              <Text style={{
                color: activeTab === 'shopping' ? FODEM_COLORS.primary : FODEM_COLORS.textSecondary,
                fontSize: 16,
                fontWeight: activeTab === 'shopping' ? '600' : '500',
                marginLeft: 6,
              }}>
                Compras ({getShoppingList().length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido de tabs */}
          {activeTab === 'stock' ? (
            products.length > 0 ? (
              <View style={{ gap: 12 }}>
                {products.map((product) => (
                  <View key={product.id} style={{
                    backgroundColor: FODEM_COLORS.background,
                    padding: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: product.current_stock <= product.min_recommended ? '#DC3545' : FODEM_COLORS.border,
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
                        alignItems: 'center',
                        gap: 12,
                      }}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: FODEM_COLORS.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            minWidth: 44,
                            alignItems: 'center',
                          }}
                          onPress={() => handleUpdateStock(product, 1)}
                        >
                          <Text style={{ color: FODEM_COLORS.textLight, fontSize: 18, fontWeight: 'bold' }}>+</Text>
                        </TouchableOpacity>
                        <Text style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: product.current_stock <= product.min_recommended ? '#DC3545' : FODEM_COLORS.textPrimary,
                          minWidth: 30,
                          textAlign: 'center',
                        }}>
                          {product.current_stock}
                        </Text>
                        <TouchableOpacity
                          style={{
                            backgroundColor: FODEM_COLORS.secondary,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            minWidth: 44,
                            alignItems: 'center',
                          }}
                          onPress={() => handleUpdateStock(product, -1)}
                        >
                          <Text style={{ color: FODEM_COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' }}>-</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.textSecondary,
                      }}>
                        Mín: {product.min_recommended} | Ideal: {product.ideal_amount}
                      </Text>
                      {product.current_stock <= product.min_recommended && (
                        <Text style={{
                          fontSize: 12,
                          color: '#DC3545',
                          fontWeight: '500',
                        }}>
                          Stock bajo
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
          <View style={{
            alignItems: 'center',
            paddingVertical: 40,
          }}>
            <Icon name="inventory" size={48} color={FODEM_COLORS.border} />

            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 8,
              marginTop: 16,
              color: FODEM_COLORS.textPrimary,
              textAlign: 'center',
            }}>
              No tienes productos aún
            </Text>

            <Text style={{
              fontSize: 14,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 24,
            }}>
              Comienza agregando productos a tu despensa para llevar un control de tu stock.
            </Text>

                <TouchableOpacity 
                  style={{
                    backgroundColor: FODEM_COLORS.primary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
                  }}
                  onPress={() => setShowAddProductModal(true)}
                >
              <Icon name="add" size={16} color={FODEM_COLORS.textLight} />
              <Text style={{
                color: FODEM_COLORS.textLight,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Agregar Primer Producto
              </Text>
            </TouchableOpacity>
          </View>
            )
          ) : (
            // Tab de compras mejorada
            getShoppingList().length > 0 ? (
              <View style={{ gap: 16 }}>
                {getShoppingList().map((product) => {
                  const needsMin = product.current_stock < product.min_recommended;
                  const needsIdeal = product.current_stock < product.ideal_amount;
                  const amountToMin = product.min_recommended - product.current_stock;
                  const amountToIdeal = product.ideal_amount - product.current_stock;
                  
                  return (
                    <View key={product.id} style={{
                      backgroundColor: FODEM_COLORS.background,
                      padding: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: FODEM_COLORS.border,
                    }}>
                      {/* Header del producto */}
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
                        <Text style={{
                          fontSize: 14,
                          color: FODEM_COLORS.textSecondary,
                        }}>
                          Stock: {product.current_stock}
                        </Text>
                      </View>

                      {/* Información de stock mejorada */}
                      <View style={{
                        backgroundColor: FODEM_COLORS.surface,
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: needsMin ? FODEM_COLORS.secondaryDark : FODEM_COLORS.border,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: FODEM_COLORS.textPrimary,
                          }}>
                            Stock actual:
                          </Text>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: FODEM_COLORS.textPrimary,
                          }}>
                            {product.current_stock} unidades
                          </Text>
                        </View>
                        
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}>
                          <Text style={{
                            fontSize: 13,
                            color: FODEM_COLORS.textSecondary,
                          }}>
                            Mínimo recomendado:
                          </Text>
                          <Text style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: needsMin ? FODEM_COLORS.secondaryDark : FODEM_COLORS.textPrimary,
                          }}>
                            {product.min_recommended} unidades
                          </Text>
                        </View>
                        
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}>
                          <Text style={{
                            fontSize: 13,
                            color: FODEM_COLORS.textSecondary,
                          }}>
                            Cantidad ideal:
                          </Text>
                          <Text style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: needsIdeal ? FODEM_COLORS.primary : FODEM_COLORS.textPrimary,
                          }}>
                            {product.ideal_amount} unidades
                          </Text>
                        </View>
                        
                        {/* Información clara de lo que falta */}
                        {(needsMin || needsIdeal) && (
                          <View style={{
                            backgroundColor: FODEM_COLORS.background,
                            padding: 8,
                            borderRadius: 6,
                            marginTop: 4,
                          }}>
                            <Text style={{
                              fontSize: 12,
                              color: FODEM_COLORS.textSecondary,
                              textAlign: 'center',
                              fontWeight: '500',
                            }}>
                              {needsMin && needsIdeal 
                                ? `Faltan ${amountToMin} para mínimo y ${amountToIdeal} para ideal`
                                : needsMin 
                                  ? `Faltan ${amountToMin} unidades para llegar al mínimo`
                                  : `Faltan ${amountToIdeal} unidades para llegar al ideal`
                              }
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Botones de compra */}
                      <View style={{
                        flexDirection: 'row',
                        gap: 8,
                      }}>
                        {needsMin && (
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              backgroundColor: FODEM_COLORS.secondaryDark,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                              alignItems: 'center',
                            }}
                            onPress={() => handleUpdateStock(product, amountToMin)}
                          >
                            <Text style={{
                              color: FODEM_COLORS.textLight,
                              fontSize: 14,
                              fontWeight: '600',
                            }}>
                              Comprar Mínimo ({amountToMin})
                            </Text>
                          </TouchableOpacity>
                        )}
                        
                        {needsIdeal && (
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              backgroundColor: FODEM_COLORS.primary,
                              paddingVertical: 12,
                              paddingHorizontal: 16,
                              borderRadius: 8,
                              alignItems: 'center',
                            }}
                            onPress={() => handleUpdateStock(product, amountToIdeal)}
                          >
                            <Text style={{
                              color: FODEM_COLORS.textLight,
                              fontSize: 14,
                              fontWeight: '600',
                            }}>
                              Comprar Ideal ({amountToIdeal})
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Botón "Otro" para compra personalizada */}
                        <TouchableOpacity
                          style={{
                            backgroundColor: FODEM_COLORS.border,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            alignItems: 'center',
                            minWidth: 80,
                          }}
                          onPress={() => handleCustomPurchase(product)}
                        >
                          <Text style={{
                            color: FODEM_COLORS.textPrimary,
                            fontSize: 14,
                            fontWeight: '600',
                          }}>
                            Otro...
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{
                alignItems: 'center',
                paddingVertical: 40,
              }}>
                <Icon name="shopping" size={48} color={FODEM_COLORS.border} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 8,
                  marginTop: 16,
                  color: FODEM_COLORS.textPrimary,
                  textAlign: 'center',
                }}>
                  No hay productos para comprar
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: FODEM_COLORS.textSecondary,
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                  Todos tus productos tienen suficiente stock.
                </Text>
              </View>
            )
          )}
        </View>

        {/* Indicador de plataforma */}
        <Text style={{
          fontSize: 12,
          color: FODEM_COLORS.textSecondary,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          Plataforma: {Platform.OS}
        </Text>
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
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Seleccionar Hogar
            </Text>
            
            <View style={{ gap: 12, marginBottom: 20 }}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{household.description}</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: currentHousehold?.id === household.id ? FODEM_COLORS.textLight : FODEM_COLORS.textPrimary,
                    }}>
                      {household.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: FODEM_COLORS.secondary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
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

      {/* Modal Agregar Producto */}
      <Modal
        visible={showAddProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddProductModal(false)}
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
              Agregar Producto
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
                  value={newProduct.name}
                  onChangeText={(text) => setNewProduct({...newProduct, name: text})}
                  placeholder="Ej: Arroz, Leche, Pan..."
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
                    value={newProduct.current_stock?.toString()}
                    onChangeText={(text) => setNewProduct({...newProduct, current_stock: parseInt(text) || 0})}
                    keyboardType="numeric"
                    placeholder="0"
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
                    value={newProduct.min_recommended?.toString()}
                    onChangeText={(text) => setNewProduct({...newProduct, min_recommended: parseInt(text) || 1})}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor={FODEM_COLORS.textSecondary}
                  />
                </View>
              </View>

              <View>
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
                  value={newProduct.ideal_amount?.toString()}
                  onChangeText={(text) => setNewProduct({...newProduct, ideal_amount: parseInt(text) || 2})}
                  keyboardType="numeric"
                  placeholder="2"
                  placeholderTextColor={FODEM_COLORS.textSecondary}
        />
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
                onPress={() => setShowAddProductModal(false)}
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
                onPress={handleCreateProduct}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Crear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Compra Personalizada */}
      <Modal
        visible={showCustomPurchaseInput}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelCustomPurchase}
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
              Comprar Cantidad Personalizada
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: FODEM_COLORS.textSecondary,
              marginBottom: 24,
              textAlign: 'center',
            }}>
              {customPurchaseProduct?.name}
            </Text>

            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: FODEM_COLORS.textPrimary,
                marginBottom: 8,
              }}>
                Cantidad a comprar
              </Text>
              <TextInput
                style={{
                  backgroundColor: FODEM_COLORS.background,
                  padding: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: FODEM_COLORS.border,
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  textAlign: 'center',
                }}
                value={customPurchaseAmount}
                onChangeText={setCustomPurchaseAmount}
                keyboardType="numeric"
                placeholder="Ej: 5"
                placeholderTextColor={FODEM_COLORS.textSecondary}
                autoFocus={true}
              />
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
                onPress={handleCancelCustomPurchase}
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
                onPress={handleConfirmCustomPurchase}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
} 