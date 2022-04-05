import React, {
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import mojs from 'mo-js';
import Clap from '../assets/clap.svg';
import styles from './index.css';

/**
 * Reusable Style
 */
const useClapAnimation = ({
  duration: tlDuration,
  clapEl,
  countEl,
  clapTotalEl,
}) => {
  const [animationTimeline, setAnimationTimeline] = useState(
    new mojs.Timeline()
  );

  useLayoutEffect(() => {
    if (!clapEl || !countEl || !clapTotalEl) {
      return;
    }

    const scaleButton = new mojs.Html({
      el: clapEl,
      duration: tlDuration,
      scale: { 1.3: 1 },
      easing: mojs.easing.ease.out,
    });

    const triangleBurst = new mojs.Burst({
      parent: clapEl,
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
      parent: clapEl,
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
      el: countEl,
      opacity: { 0: 1 },
      y: { 0: -30 },
      duration: tlDuration,
    }).then({
      opacity: { 1: 0 },
      y: -80,
      delay: tlDuration / 2,
    });

    const countTotalAnimation = new mojs.Html({
      el: clapTotalEl,
      opacity: { 0: 1 },
      delay: (3 * tlDuration) / 2,
      duration: tlDuration,
      y: { 0: -3 },
    });

    if (typeof clapEl === 'string') {
      const clap = document.getElementById('clap');
      clap.style.transform = 'scale(1,1)';
    } else {
      clapEl.style.transform = 'scale(1,1)';
    }

    const updatedAnimationTimeline = animationTimeline.add([
      scaleButton,
      countTotalAnimation,
      countAnimation,
      triangleBurst,
      circleBurst,
    ]);

    setAnimationTimeline(updatedAnimationTimeline);
  }, [tlDuration, animationTimeline, clapEl, countEl, clapTotalEl]);

  return animationTimeline;
};

const initialState = {
  count: 0,
  countTotal: 267,
  isClicked: false,
};

const MediumClapContext = createContext();
const { Provider } = MediumClapContext;

const MediumClap = ({ children, onClap, style: userStyles = {} }) => {
  const MAXIMUM_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal, isClicked } = clapState;

  const [{ clapRef, clapCountRef, clapTotalRef }, setRefState] = useState({});

  const setRef = useCallback((node) => {
    if (node !== null) {
      setRefState((prevRefState) => ({
        ...prevRefState,
        [node.dataset.refkey]: node,
      }));
    }
  }, []);

  const animationTimeline = useClapAnimation({
    duration: 300,
    clapEl: clapRef,
    countEl: clapCountRef,
    clapTotalEl: clapTotalRef,
  });

  const componentJustMounted = useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current) {
      onClap && onClap(clapState);
    }
    componentJustMounted.current = false;
  }, [count]);

  const handleClapClick = () => {
    animationTimeline.replay();

    setClapState({
      isClicked: true,
      count: Math.min(count + 1, MAXIMUM_USER_CLAP),
      countTotal: count < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
    });
  };

  const memoizedValue = useMemo(
    () => ({
      ...clapState,
      setRef,
    }),
    [clapState, setRef]
  );

  return (
    <Provider value={memoizedValue}>
      <button
        ref={setRef}
        data-refkey="clapRef"
        className={styles.clap}
        onClick={handleClapClick}
        style={userStyles}
      >
        {children}
      </button>
    </Provider>
  );
};

/**
 * Sub Components
 */

const ClapIcon = ({ style: userStyles = {} }) => {
  const { isClicked } = useContext(MediumClapContext);
  return (
    <Clap
      className={`${styles.icon} ${isClicked && styles.checked}`}
      style={userStyles}
    />
  );
};

const ClapCount = ({ style: userStyles = {} }) => {
  const { count, setRef } = useContext(MediumClapContext);
  return (
    <span
      ref={setRef}
      data-refkey="clapCountRef"
      className={styles.count}
      style={userStyles}
    >
      + {count}
    </span>
  );
};

const CountTotal = ({ style: userStyles = {} }) => {
  const { countTotal, setRef } = useContext(MediumClapContext);
  return (
    <span
      ref={setRef}
      data-refkey="clapTotalRef"
      className={styles.total}
      style={userStyles}
    >
      {countTotal}
    </span>
  );
};

MediumClap.Icon = ClapIcon;
MediumClap.Count = ClapCount;
MediumClap.Total = CountTotal;

/**
 * Usage
 */

const Usage = () => {
  const [count, setCount] = useState(0);
  const handleClap = (clapState) => {
    setCount(clapState.count);
  };

  return (
    <div style={{ width: '100' }}>
      <MediumClap onClap={handleClap} style={{ border: '1px solid red' }}>
        <MediumClap.Icon />
        <MediumClap.Count />
        <MediumClap.Total />
      </MediumClap>
      <div>{`You have clapped ${count}`}</div>
    </div>
  );
};

export default Usage;
