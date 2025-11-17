import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CalculatorCardProps {
  title: string;
  children: React.ReactNode;
}

export function CalculatorCard({ title, children }: CalculatorCardProps) {
  const getIcon = () => {
    if (title.includes('Transfer Cost')) return 'calculator';
    if (title.includes('Bond Cost')) return 'home';
    if (title.includes('Repayment')) return 'trending-up';
    return 'document-text';
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon()} size={24} color="#2C5530" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e8f5e9',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#e8f5e9',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C5530',
    flex: 1,
  },
  content: {
    paddingTop: 4,
  },
});