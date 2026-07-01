import { useCallback, useRef } from 'react';

/**
 * Create a memoized renderItem function for FlatLists
 * Prevents unnecessary re-renders of list items when parent re-renders
 * 
 * Usage:
 * const renderItem = useMemoizedRenderItem(({ item }) => <ListItem data={item} />, []);
 * <FlatList renderItem={renderItem} />
 */
export const useMemoizedRenderItem = (
  renderFunction: (props: any) => JSX.Element,
  dependencies: any[] = []
): ((props: any) => JSX.Element) => {
  return useCallback(renderFunction, dependencies);
};

/**
 * Optimize FlatList performance automatically
 * Apply these props to your FlatList for best performance
 */
export const FLATLIST_OPTIMIZATION_CONFIG = {
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: true,
  initialNumToRender: 10,
};

/**
 * Create optimized getItemLayout for constant-height FlatList items
 * Improves scrolling performance significantly
 * 
 * Usage:
 * const getItemLayout = useGetItemLayout(100); // itemHeight = 100
 * <FlatList getItemLayout={getItemLayout} />
 */
export const useGetItemLayout = (itemHeight: number) => {
  return useCallback(
    (_data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );
};
