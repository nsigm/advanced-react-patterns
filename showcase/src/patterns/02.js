import React, { useEffect, useState } from 'react';
import mojs from 'mo-js';
import Clap from '../assets/clap.svg';
import styles from './index.css';

const initialState = {
  count: 0,
  countTotal: 267,
  isClicked: false,
};

/**
 * Custom Hook for animation
 */
const useClapAnimation = () => {
  const [animationTimeline, setAnimationTimeline] = useState(() => new mojs.Timeline())

  useEffect(() => {
    const tlDuration = 300;
    const scaleButton = new mojs.Html({
      el: '#clap',
      duration: tlDuration,
      scale: { 1.3: 1 },
      easing: mojs.easing.ease.out,
    });

    const triangleBurst = new mojs.Burst({
      parent: '#clap',
      radius: { 50: 95 },
      count: 5,
      angle: 30,
      children: {
        shape: 'polygon',
        radius: { 6: 0 },
        stroke: 'rgba(211,54,0,0.5)',
        strokeWidth: 2,
        angle: 210,
        speed: 0.2,
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: tlDuration,
      },
    });

    const circleBurst = new mojs.Burst({
      parent: '#clap',
      radius: { 50: 75 },
      angle: 135,
      duration: tlDuration,
      children: {
        shape: 'circle',
        fill: 'rgba(149,,165,166,0.5)',
        delay: 30,
        speed: 0.2,
        radius: { 6: 0 },
        easing: mojs.easing.bezier(0.1, 1, 0.3, 1),
        duration: tlDuration,
      },
    });
    const countAnimation = new mojs.Html({
      el: '#clapCount',
      opacity: { 0: 1 },
      y: { 0: -30 },
      duration: tlDuration,
    }).then({
      opacity: { 1: 0 },
      y: -80,
      delay: tlDuration / 2,
    });

    const countTotalAnimation = new mojs.Html({
      el: '#clapCountTotal',
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
      y: { 0: -3 },
    });

    const clap = document.getElementById('clap');
    clap.style.transform = 'scale(1,1';

    const newAnimationTimeline = animationTimeline.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
      triangleBurst,
      circleBurst,
    ]);
    setAnimationTimeline(newAnimationTimeline);
  }, [])
  return animationTimeline
}

const MediumClap = () => {
  const MAXIMUM_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal, isClicked } = clapState;

  const animationTimeline = useClapAnimation();
  
  const handleClapClick = () => {
    animationTimeline.replay();
    setClapState({
      isClicked: true,
      count: Math.min(count + 1, MAXIMUM_USER_CLAP),
      countTotal: count < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
    });
  };

  return (
    <button id="clap" className={styles.clap} onClick={handleClapClick}>
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
  return (
    <span id="clapCount" className={styles.count}>
      + {count}
    </span>
  );
};

const ClapTotal = ({ countTotal }) => {
  return (
    <span id="clapCountTotal" className={styles.total}>
      {countTotal}
    </span>
  );
};

/**
 * Usage
 */

const Usage = () => {
  return <MediumClap/>;
};

export default Usage;
