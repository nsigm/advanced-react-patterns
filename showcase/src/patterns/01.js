import React, { useState } from 'react';
import Clap from '../assets/clap.svg';
import styles from './index.css';

const initialState = {
  count: 0,
  countTotal: 267,
  isClicked: false,
};

const MediumClap = () => {
  const MAXIMUM_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal, isClicked } = clapState;

  const handleClapClick = () => {
    setClapState({
      isClicked: true,
      count: Math.min(count + 1, MAXIMUM_USER_CLAP),
      countTotal:
        count < MAXIMUM_USER_CLAP
          ? countTotal + 1
          : countTotal,
    });
  };

  return (
    <button className={styles.clap} onClick={handleClapClick}>
      <ClapIcon isClicked={isClicked} />
      <ClapCount count={count} />
      <ClapTotal countTotal={countTotal} />
    </button>
  );
};

/**
 * Sub Components
 */

const ClapIcon = ({ isClicked }) => {
  return <Clap className={`${styles.icon} ${isClicked && styles.checked}`} />;
};

const ClapCount = ({ count }) => {
  return <span className={styles.count}>+ {count}</span>;
};

const ClapTotal = ({ countTotal }) => {
  return <span className={styles.total}>{countTotal}</span>;
};

export default MediumClap;
