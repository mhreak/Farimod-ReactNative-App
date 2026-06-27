import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from './Text';
import colors from '../config/colors';

const MemberGroupPicker = ({
  visible,
  onClose,
  items = [],
  selectedItems = [],
  onConfirm,
  onSearch,
  onLoadMore,
  loading = false,
  hasMore = true,
  placeholder = 'جستجوی گروه...',
  emptyMessage = 'گروهی یافت نشد',
}) => {
  const [searchText, setSearchText] = useState('');
  const [localSelectedItems, setLocalSelectedItems] = useState([]);

  useEffect(() => {
    if (visible) {
      setLocalSelectedItems(selectedItems);
      setSearchText('');
    }
  }, [visible, selectedItems]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const toggleItem = (item) => {
    const index = localSelectedItems.findIndex(
      (selected) => selected.value === item.value
    );

    if (index >= 0) {
      setLocalSelectedItems(
        localSelectedItems.filter((_, i) => i !== index)
      );
    } else {
    
      setLocalSelectedItems([...localSelectedItems, item]);
    }
  };

  const isSelected = (item) => {
    return localSelectedItems.some(
      (selected) => selected.value === item.value
    );
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(localSelectedItems);
    }
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedItems(selectedItems);
    onClose();
  };

  const renderItem = ({ item }) => {
    const selected = isSelected(item);

    return (
      <TouchableOpacity
        style={[styles.item, selected && styles.itemSelected]}
        onPress={() => toggleItem(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <View style={styles.itemTextContainer}>
            <AppText style={[styles.itemLabel, selected && styles.itemLabelSelected]}>
              {item.label}
            </AppText>
            {item.memberCount !== undefined && (
              <AppText style={styles.itemSubtext}>
                {item.memberCount} عضو
              </AppText>
            )}
          </View>
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected && (
              <MaterialIcons name="check" size={18} color={colors.white} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <AppText style={styles.footerLoaderText}>در حال بارگذاری...</AppText>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="inbox" size={48} color={colors.medium} />
        <AppText style={styles.emptyText}>{emptyMessage}</AppText>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <MaterialIcons name="close" size={24} color={colors.dark} />
            </TouchableOpacity>
            <AppText style={styles.headerTitle}>انتخاب گروه‌های عضویت</AppText>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={colors.medium}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              value={searchText}
              onChangeText={handleSearch}
              placeholderTextColor={colors.medium}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => handleSearch('')}
                style={styles.clearButton}
              >
                <MaterialIcons name="clear" size={20} color={colors.medium} />
              </TouchableOpacity>
            )}
          </View>

          {/* Selected Count */}
          {localSelectedItems.length > 0 && (
            <View style={styles.selectedCountContainer}>
              <AppText style={styles.selectedCountText}>
                {localSelectedItems.length} گروه انتخاب شده
              </AppText>
            </View>
          )}

          {/* List */}
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.value.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (hasMore && !loading && onLoadMore) {
                onLoadMore();
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={true}
          />

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <AppText style={styles.cancelButtonText}>انصراف</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <AppText style={styles.confirmButtonText}>تایید</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(203, 213, 225, 0.3)',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 1)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.dark,
    textAlign: 'right',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 5,
  },
  selectedCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedCountText: {
    fontSize: 13,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.primary,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(203, 213, 225, 0.4)',
    overflow: 'hidden',
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  itemContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  itemLabel: {
    fontSize: 15,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.dark,
    textAlign: 'right',
    marginBottom: 3,
  },
  itemLabelSelected: {
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.primary,
  },
  itemSubtext: {
    fontSize: 12,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    textAlign: 'right',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(203, 213, 225, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footerLoader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  footerLoaderText: {
    fontSize: 13,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    marginTop: 15,
  },
  footer: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(203, 213, 225, 0.3)',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(241, 245, 249, 1)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.white,
  },
});

export default MemberGroupPicker;