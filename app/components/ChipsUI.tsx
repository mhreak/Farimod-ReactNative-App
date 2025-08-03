import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from '../components/Text';
import colors from '../config/colors';
import { MemberGroup } from '../config/type';

interface ChipsUIProps {
  groups: MemberGroup[];
  selectedGroups: number[];
  onToggleGroup: (groupId: number) => void;
  maxSelectable?: number;
  allowMultipleSelection?: boolean;
}

const ChipsUI: React.FC<ChipsUIProps> = ({
  groups,
  selectedGroups,
  onToggleGroup,
  maxSelectable,
  allowMultipleSelection = true,
}) => {
  const renderChip = (group: MemberGroup) => {
    const isSelected = selectedGroups.includes(group.MemberGroupId);
    const canSelect = allowMultipleSelection
      ? !maxSelectable || selectedGroups.length < maxSelectable || isSelected
      : selectedGroups.length === 0 || isSelected;

    return (
      <TouchableOpacity
        key={group.MemberGroupId}
        style={[
          styles.chip,
          isSelected && styles.selectedChip,
          !canSelect && styles.disabledChip,
        ]}
        onPress={() => canSelect && onToggleGroup(group.MemberGroupId)}
        disabled={!canSelect}
        activeOpacity={0.7}
      >
        <View style={styles.chipContent}>
          {isSelected && (
            <MaterialIcons
              name="check-circle"
              size={16}
              color={colors.white}
              style={styles.checkIcon}
            />
          )}
          <AppText
            style={[
              styles.chipText,
              isSelected && styles.selectedChipText,
              !canSelect && styles.disabledChipText,
            ]}
          >
            {group.GroupName}
          </AppText>
          {!isSelected && (
            <MaterialIcons
              name="add-circle-outline"
              size={16}
              color={canSelect ? colors.medium : colors.light}
              style={styles.addIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.chipsContainer}>
          {groups
            .filter(group => group.Active)
            .map(group => renderChip(group))}
        </View>
      </ScrollView>

      {maxSelectable && (
        <AppText style={styles.helperText}>
          {selectedGroups.length}/{maxSelectable} گروه انتخاب شده
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContainer: {
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  chip: {
    backgroundColor: colors.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.medium,
    marginRight: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignSelf: 'flex-start',
  },
  selectedChip: {
    backgroundColor: colors.success, 
    borderColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledChip: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    color: colors.dark,
    fontFamily: 'Yekan_Bakh_Regular',
    textAlign: 'center',
  },
  selectedChipText: {
    color: colors.white,
    fontFamily: 'Yekan_Bakh_Bold',
  },
  disabledChipText: {
    color: '#bdbdbd',
  },
  checkIcon: {
    marginRight: 6,
  },
  addIcon: {
    marginLeft: 6,
  },
  helperText: {
    fontSize: 12,
    color: colors.medium,
    fontFamily: 'Yekan_Bakh_Regular',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChipsUI;