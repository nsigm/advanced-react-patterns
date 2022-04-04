import React, { useState } from 'react';
import Clap from '../assets/clap.svg';
import styles from './index.css';

const initialState = {
  count: 0,
  countTotal: 267,
};

const MediumClap = () => {
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal } = clapState;

  const handleClapClick = () => {
    setClapState((prevState) => ({
      count: prevState.count + 1,
      countTotal: prevState.countTotal + 1,
    }));
  };

  return (
    <button className={styles.clap} onClick={handleClapClick}>
      <ClapIcon />
      <ClapCount count={count} />
      <ClapTotal countTotal={countTotal} />
    </button>
  );
};

/**
 * Sub Components
 */

const ClapIcon = () => {
  return <Clap className={styles.icon} />;
};

const ClapCount = ({ count }) => {
  return <span className={styles.count}>+ {count}</span>;
};

const ClapTotal = ({ countTotal }) => {
  return <span className={styles.total}>{countTotal}</span>;
};

export default MediumClap;
