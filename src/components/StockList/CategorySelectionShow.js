import React, { useState, useEffect, useCallback } from 'react'
import 'asset/views.css';
import PropTypes from 'prop-types';

import Chip from '@material-ui/core/Chip';

export const CategorySelectionShow = (props) => {
  const { category_map, selectedCategory } = props
  const longPress = useLongPress(() => longTapped(), 500);

  const isEmpty = (obj) => {
    return !Object.keys(obj).length;
  }

  const longTapped = () => {
    // カテゴリ名変更
  }

  const categoryChip = (category_map) => {
    if(!isEmpty(category_map)){
      return (
        Object.keys(category_map).map((val, idx) => (
          <Chip 
            label={category_map[val]} 
            variant={selectedCategory === val ? "default":"outlined"} 
            key={idx} 
            color="primary" 
            onClick={() => props.handleCategorySelect(val)} 
            {...longPress}
            />
        ))
      )
    }
    else{
      return null
    }
  }

  return (
    <div className="stock-list-categories">
      <div className="stock-list-categories-show">
        {categoryChip(category_map)}
        <Chip label="No category" variant={props.selectedCategory === "" ? "default":"outlined"} key={-2} onClick={()=> props.handleCategorySelectNone()} />
        <Chip label="All Category" variant={props.data_list.length === props.show_list.length ? "default":"outlined"} key={-1} onClick={() => props.handleCategorySelectAll()} />
        </div>
    </div>
  )
}

CategorySelectionShow.propTypes = {
  category_map: PropTypes.object,
  selectedCategory: PropTypes.string,
  handleCategorySelect: PropTypes.func,
  handleCategorySelectNone: PropTypes.func,
  handleCategorySelectAll: PropTypes.func,
  data_list: PropTypes.array,
  show_list: PropTypes.array,
}


const useLongPress = (callback = () => {}, ms = 300) => {
  const [startLongPress, setStartLongPress] = useState(false);

  useEffect(() => {
    let timerId;
    if (startLongPress) {
      timerId = setTimeout(callback, ms);
    } else {
      clearTimeout(timerId);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [startLongPress]);

  const start = useCallback(() => {
    setStartLongPress(true);
  }, []);
  const stop = useCallback(() => {
    setStartLongPress(false);
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}