import React, { useState } from 'react';
import mojs from 'mo-js';
import Clap from '../assets/clap.svg';
import styles from './index.css';

const initialState = {
  count: 0,
  countTotal: 267,
  isClicked: false,
};

/**
 * Higher Order Component
 */

const withClapAnimation = (WrappedComponent) => {
  class WithClapAnimation extends React.Component {
    animationTimeline = new mojs.Timeline();
    state = {
      animationTimeLine: this.animationTimeline,
    };

    componentDidMount() {
      const scaleButton = new mojs.Html({
        el: '#clap',
        duration: 300,
        scale: { 1.3: 1 },
        easing: mojs.easing.ease.out,
      });

      const clap = document.getElementById('clap');
      clap.style.transform = 'scale(1,1';

      const newAnimationTimeline = this.animationTimeline.add([scaleButton]);
      this.setState({ animationTimeLine: newAnimationTimeline });
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          animationTimeline={this.state.animationTimeLine}
        />
      );
    }
  }
  return WithClapAnimation;
};

const MediumClap = ({ animationTimeline }) => {
  const MAXIMUM_USER_CLAP = 12;
  const [clapState, setClapState] = useState(initialState);
  const { count, countTotal, isClicked } = clapState;

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
  return <span className={styles.count}>+ {count}</span>;
};

const ClapTotal = ({ countTotal }) => {
  return <span className={styles.total}>{countTotal}</span>;
};

/**
 * Usage
 */

const Usage = () => {
  const AnimatedMediumClap = withClapAnimation(MediumClap);
  return <AnimatedMediumClap />;
};

export default Usage;
