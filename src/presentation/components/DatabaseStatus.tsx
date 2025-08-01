import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../../shared/config/supabase';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { Icon } from './Icon';

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
  rowCount?: number;
}

export const DatabaseStatus: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    const requiredTables = [
      'households',
      'household_members',
      'household_invitations',
      'products',
      'user_profiles'
    ];

    const tableStatuses: TableStatus[] = [];

    for (const tableName of requiredTables) {
      try {
        // Intentar hacer una consulta simple para verificar si la tabla existe
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          tableStatuses.push({
            name: tableName,
            exists: false,
            error: error.message,
          });
        } else {
          tableStatuses.push({
            name: tableName,
            exists: true,
            rowCount: count || 0,
          });
        }
      } catch (error: any) {
        tableStatuses.push({
          name: tableName,
          exists: false,
          error: error.message,
        });
      }
    }

    setTables(tableStatuses);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      checkTables();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Estado de la Base de Datos</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={FODEM_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {loading ? (
            <Text style={styles.loading}>Verificando tablas...</Text>
          ) : (
            <View style={styles.tableList}>
              {tables.map((table) => (
                <View key={table.name} style={styles.tableItem}>
                  <View style={styles.tableHeader}>
                    <Icon
                      name={table.exists ? "check-circle" : "error"}
                      size={20}
                      color={table.exists ? FODEM_COLORS.success : FODEM_COLORS.error}
                    />
                    <Text style={[
                      styles.tableName,
                      { color: table.exists ? FODEM_COLORS.textPrimary : FODEM_COLORS.error }
                    ]}>
                      {table.name}
                    </Text>
                  </View>
                  
                  {table.exists ? (
                    <Text style={styles.tableInfo}>
                      ✅ Existe ({table.rowCount} filas)
                    </Text>
                  ) : (
                    <Text style={styles.tableError}>
                      ❌ No existe: {table.error}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={checkTables}>
              <Text style={styles.buttonText}>Verificar Nuevamente</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: FODEM_COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: FODEM_COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  loading: {
    fontSize: 16,
    color: FODEM_COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tableList: {
    gap: 12,
  },
  tableItem: {
    backgroundColor: FODEM_COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FODEM_COLORS.border,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tableInfo: {
    fontSize: 14,
    color: FODEM_COLORS.textSecondary,
  },
  tableError: {
    fontSize: 14,
    color: FODEM_COLORS.error,
  },
  actions: {
    marginTop: 20,
  },
  button: {
    backgroundColor: FODEM_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: FODEM_COLORS.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
}); 