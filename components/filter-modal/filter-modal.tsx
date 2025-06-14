import { ThemedText } from '@/components/ThemedText';
import { FilterTag } from '@/components/ui/filter-tag';
import { Colors } from '@/constants/Colors';
import { FilterCategory, FilterModalProps } from '@/types/ride';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export function FilterModal({
  isVisible,
  onClose,
  onApply,
  onClear,
  filterState,
  onFilterChange,
  onDistanceChange
}: FilterModalProps) {
  
  const toggleFilter = (category: FilterCategory, value: string) => {
    onFilterChange(category, value);
  };

  const filterOptions = {
    bikeType: [
      { key: 'analog', label: 'אנלוגי' },
      { key: 'electric', label: 'חשמלי' }
    ],
    type: [
      { key: 'road', label: 'כביש' },
      { key: 'offroad', label: 'שטח' },
      { key: 'trails', label: 'שבילים' },
      { key: 'urban', label: 'עירוני' }
    ],
    difficulty: [
      { key: 'easy', label: 'קל' },
      { key: 'medium', label: 'בינוני' },
      { key: 'hard', label: 'קשה' }
    ],
    technical: [
      { key: 'none', label: 'לא טכני' },
      { key: 'easy', label: 'טכני קל' },
      { key: 'medium', label: 'טכני בינוני' },
      { key: 'hard', label: 'טכני מאוד' }
    ],
    speed: [
      { key: 'slow', label: 'קצב איטי' },
      { key: 'medium', label: 'קצב בינוני' },
      { key: 'medium-high', label: 'קצב בינוני-גבוה' },
      { key: 'fast', label: 'קצב מהיר' }
    ]
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <ThemedText style={styles.modalTitle}>סינון רכיבות</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Bike Type Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>סוג אופניים</ThemedText>
            <View style={styles.filterTagsContainer}>
              {filterOptions.bikeType.map(option => (
                <FilterTag
                  key={option.key}
                  label={option.label}
                  isSelected={filterState.selectedBikeTypes.includes(option.key)}
                  onPress={() => toggleFilter('bikeType', option.key)}
                />
              ))}
            </View>
          </View>

          {/* Distance Range */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>
              מרחק מקסימלי: {filterState.distanceRange} ק"מ
            </ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={100}
              value={filterState.distanceRange}
              onValueChange={onDistanceChange}
              step={5}
              minimumTrackTintColor={Colors.light.primary}
              maximumTrackTintColor={Colors.light.border}
            />
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabel}>5 ק"מ</ThemedText>
              <ThemedText style={styles.sliderLabel}>100 ק"מ</ThemedText>
            </View>
          </View>

          {/* Ride Type Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>סוג רכיבה</ThemedText>
            <View style={styles.filterTagsContainer}>
              {filterOptions.type.map(option => (
                <FilterTag
                  key={option.key}
                  label={option.label}
                  isSelected={filterState.selectedTypes.includes(option.key)}
                  onPress={() => toggleFilter('type', option.key)}
                />
              ))}
            </View>
          </View>

          {/* Difficulty Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>רמת קושי</ThemedText>
            <View style={styles.filterTagsContainer}>
              {filterOptions.difficulty.map(option => (
                <FilterTag
                  key={option.key}
                  label={option.label}
                  isSelected={filterState.selectedDifficulties.includes(option.key)}
                  onPress={() => toggleFilter('difficulty', option.key)}
                />
              ))}
            </View>
          </View>

          {/* Technical Level Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>רמה טכנית</ThemedText>
            <View style={styles.filterTagsContainer}>
              {filterOptions.technical.map(option => (
                <FilterTag
                  key={option.key}
                  label={option.label}
                  isSelected={filterState.selectedTechnicalLevels.includes(option.key)}
                  onPress={() => toggleFilter('technical', option.key)}
                />
              ))}
            </View>
          </View>

          {/* Speed Filter */}
          <View style={styles.filterSection}>
            <ThemedText style={styles.filterSectionTitle}>קצב רכיבה</ThemedText>
            <View style={styles.filterTagsContainer}>
              {filterOptions.speed.map(option => (
                <FilterTag
                  key={option.key}
                  label={option.label}
                  isSelected={filterState.selectedSpeeds.includes(option.key)}
                  onPress={() => toggleFilter('speed', option.key)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <ThemedText style={styles.clearButtonText}>נקה פילטרים</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onApply}>
            <ThemedText style={styles.applyButtonText}>סנן</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  filterTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 