// Bitcoin mempool widget for Übersicht
// by Volker Wieban (https://github.com/hpcodecraft)
// Version 1.0

// the CSS style for this widget, written using Emotion
// https://emotion.sh/

const textColor = "white";
const glowColor = "hotpink";
const glowStrength = 0.75;

const glowStyle = () => {
  let css = "";
  for (let i = 1; i <= 7; i++) {
    css += `0 0 ${i * glowStrength}px ${i <= 2 ? textColor : glowColor}${
      i < 7 ? "," : ""
    }`;
  }
  return css;
};

export const className = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600&display=swap');

  left: 30px;
  top: 550px;

  opacity: 0.85;

  font-size: 0.8em;

  h3 {
    margin: 0.75em 0 0.25em 0;
  }

  h3:first-of-type {
    margin: 0 0 0.25em 0;
  }

  h4 {
    margin: 0 0 0.25em 0;
  }

  fieldset {
    border: 2px solid white;
    border-radius: 5px;
    box-shadow: 0 0 ${glowStrength * 15}px hotpink, inset 0 0 ${
  glowStrength * 15
}px hotpink;
  }

  .glow {
    color: ${textColor};
    font-family: 'Rajdhani', cursive;
    text-shadow: ${glowStyle()};
  }
`;

export const command = dispatch => {
  Promise.all([
    fetch("https://mempool.space/api/blocks/tip/height").then(height =>
      height.json()
    ),
    fetch("https://mempool.space/api/v1/fees/recommended").then(fees =>
      fees.json()
    ),
    fetch("https://mempool.space/api/v1/difficulty-adjustment").then(
      difficulty => difficulty.json()
    ),
  ]).then(([height, fees, difficulty]) => {
    dispatch({ data: { height, fees, difficulty } });
  });
};

export const refreshFrequency = 30 * 1000;

export const updateState = (event, previousState) => {
  if (event.error) {
    return { ...previousState, warning: `We got an error: ${event.error}` };
  }

  return event.data;
};

let timeout;

export const render = ({ height, fees, difficulty }, dispatch) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => command(dispatch), refreshFrequency);

  return (
    <fieldset>
      <legend className="glow">BTC Mempool</legend>

      <h3 className="glow">BLOCK {height}</h3>

      <h3 className="glow">FEES</h3>
      <h4 className="glow">fast: {fees?.fastestFee} sat/vB</h4>
      <h4 className="glow">30m: {fees?.halfHourFee} sat/vB</h4>
      <h4 className="glow">60m: {fees?.hourFee} sat/vB</h4>
      <h4 className="glow">min: {fees?.minimumFee} sat/vB</h4>

      <h3 className="glow">DIFFICULTY</h3>
      <h4 className="glow">
        period progress {difficulty?.progressPercent?.toFixed(2)}%
      </h4>
      <h4 className="glow">{difficulty?.remainingBlocks} blocks remaining</h4>
      <h4 className="glow">
        next difficulty: {difficulty?.difficultyChange?.toFixed(2)}%
      </h4>
    </fieldset>
  );
};
