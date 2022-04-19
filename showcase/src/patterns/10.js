import React, {
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
  useEffect,
  useReducer,
} from 'react';
import mojs from 'mo-js';
import Clap from '../assets/clap.svg';
import styles from './index.css';
import userStyles from './usage.css';

/**
 * State Reducer Pattern
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

const INITIAL_STATE = {
  count: 0,
  countTotal: 267,
  isClicked: false,
};

/*
 * useDOMRef custom Hook
 */
const useDOMRef = () => {
  const [DOMRef, setRefState] = useState({});

  const setRef = useCallback((node) => {
    if (node !== null) {
      setRefState((prevRefState) => ({
        ...prevRefState,
        [node.dataset.refkey]: node,
      }));
    }
  }, []);

  return [DOMRef, setRef];
};

// const handleClick = (evt) => { ... }
// <button onClick={handleClick} />
const callFnsInSequence =
  (...fns) =>
  (...args) => {
    fns.forEach((fn) => fn && fn(...args));
  };

/*
 * usePrevious Hook
 */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current === undefined ? null : ref.current;
}

/*
 * useClapState custom Hook
 */
const MAXIMUM_USER_CLAP = 30;
const internalReducer = ({ count, countTotal }, { type, payload }) => {
  switch (type) {
    case 'clap':
      return {
        isClicked: true,
        count: Math.min(count + 1, MAXIMUM_USER_CLAP),
        countTotal: count < MAXIMUM_USER_CLAP ? countTotal + 1 : countTotal,
      };
    case 'reset':
      return payload;
    default:
      break;
  }
};
const useClapState = (
  initialState = INITIAL_STATE,
  reducer = internalReducer
) => {
  const userInitialState = useRef(initialState);
  const [clapState, dispatch] = useReducer(reducer, initialState);
  const { count, countTotal } = clapState;

  const updateClapState = () => dispatch({ type: 'clap' });

  // glorified counter
  const resetRef = useRef(0);
  const reset = useCallback(() => {
      dispatch({ type: 'reset', payload: userInitialState.current });
      resetRef.current++;
  }, []);

  const getTogglerProps = ({ onClick, ...otherProps } = {}) => ({
    onClick: callFnsInSequence(updateClapState, onClick),
    'aria-pressed': clapState.isClicked,
    ...otherProps,
  });

  const getCounterProps = ({ ...otherProps }) => ({
    count,
    'aria-valuemax': MAXIMUM_USER_CLAP,
    aria_valuemin: 0,
    aria_valuenow: count,
    ...otherProps,
  });

  return {
    clapState,
    updateClapState,
    getTogglerProps,
    getCounterProps,
    reset,
    resetDep: resetRef.current,
  };
};
//useClapState, internalReducer
useClapState.reducer = internalReducer;
useClapState.types = {
  clap: 'clap',
  reset: 'reset',
};
/*
 * useEffectAfterMount custom Hook
 */
const useEffectAfterMount = (callback, dependencies) => {
  const componentJustMounted = useRef(true);
  useEffect(() => {
    if (!componentJustMounted.current) {
      return callback();
    }
    componentJustMounted.current = false;
  }, dependencies);
};

/**
 * Sub Componentsd
 */

const ClapContainer = ({ children, setRef, handleClick, ...restProps }) => {
  return (
    <button
      ref={setRef}
      className={styles.clap}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </button>
  );
};

const ClapIcon = ({ isClicked }) => {
  return <Clap className={`${styles.icon} ${isClicked && styles.checked}`} />;
};

const ClapCount = ({ count, setRef, ...restProps }) => {
  return (
    <span ref={setRef} className={styles.count} {...restProps}>
      + {count}
    </span>
  );
};

const CountTotal = ({ countTotal, setRef, ...restProps }) => {
  return (
    <span ref={setRef} className={styles.total} {...restProps}>
      {countTotal}
    </span>
  );
};

/**
 * Usage
 */
const userInitialState = {
  count: 9,
  countTotal: 984,
  isClicked: true,
};

const Usage = () => {
  const [timesClapped, setTimesClapped] = useState(0)
  const isClappedTooMuch = timesClapped >= 7

  const reducer = (state, action) => {
    if(action.type === useClapState.types.clap && isClappedTooMuch) {
      return state;
    }
    return useClapState.reducer(state, action);
  };
  const { clapState, getTogglerProps, getCounterProps, reset, resetDep } =
    useClapState(userInitialState, reducer);
  const { count, countTotal, isClicked } = clapState;

  const [{ clapContainerRef, clapCountRef, clapTotalRef }, setRef] =
    useDOMRef();

  const animationTimeline = useClapAnimation({
    duration: 300,
    clapEl: clapContainerRef,
    countEl: clapCountRef,
    clapTotalEl: clapTotalRef,
  });

  const handleClick = () => {
    setTimesClapped(t => t + 1)
      !isClappedTooMuch && animationTimeline.replay()
  };

  const [uploadingReset, setUploadingReset] = useState(false);
  useEffectAfterMount(() => {
    setTimesClapped(0)
    setUploadingReset(true);

    const id = setTimeout(() => {
      setUploadingReset(false);
    }, 3000);

    return () => clearTimeout(id);
  }, [resetDep]);



  return (
    <div style={{ textAlign: 'center' }}>
      <ClapContainer
        setRef={setRef}
        data-refkey="clapContainerRef"
        {...getTogglerProps({
          onClick: handleClick,
          'aria-pressed': false,
        })}
      >
        <ClapIcon isClicked={isClicked} />
        <ClapCount
          setRef={setRef}
          data-refkey="clapCountRef"
          {...getCounterProps()}
        />
        <CountTotal
          countTotal={countTotal}
          setRef={setRef}
          data-refkey="clapTotalRef"
        />
      </ClapContainer>
      <section>
        <button onClick={reset} className={userStyles.resetBtn} disabled={uploadingReset}>
          reset
        </button>
        <pre className={userStyles.resetMsg}>
          {JSON.stringify({ timesClapped, count, countTotal })}
        </pre>
        <pre className={userStyles.resetMsg}>
          {uploadingReset ? `uploading reset ${resetDep} ...` : ''}
        </pre>
        <pre>
          {isClappedTooMuch ? 'You clapped too much...' : ''}
        </pre>
      </section>
    </div>
  );
};

export default Usage;
