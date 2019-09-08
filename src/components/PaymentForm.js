import React from "react";
import { Machine, interpret } from "xstate";

import fakePayment from "../utility/fakePayment";

const stateMachine = Machine({
  initial: "idle",
  states: {
    idle: {
      on: {
        SUBMIT: [
          {
            target: "loading",
            cond: ({ state }) => state.name !== "" && state.card !== ""
          },
          { target: "error" }
        ]
      }
    },
    loading: {
      onEntry: ["doPayment"],
      on: {
        PAYMENT_RECEIVED: "success",
        PAYMENT_FAILED: "error"
      }
    },
    error: {
      on: {
        SUBMIT: "loading",
        cond: ({ state }) => {
          console.log(state);
          return state.name !== "" && state.card !== "";
        }
      }
    },
    success: {
      type: "final"
    }
  }
});

class PaymentForm extends React.Component {
  state = {
    machine: stateMachine.initialState,
    name: "",
    card: ""
  };

  service = interpret(stateMachine).onTransition(current =>
    this.setState({ machine: current })
  );

  componentDidMount() {
    this.service.start();
  }

  componentWillUnmount() {
    this.service.stop();
  }

  doPayment = () => {
    return fakePayment()
      .then(msg => {
        // console.log(msg);
        this.service.send("PAYMENT_RECEIVED", { msg });
      })
      .catch(msg => {
        // console.log(msg);
        this.service.send("PAYMENT_FAILED", { msg });
      });
  };

  runActions = state => {
    if (state.actions.length > 0) {
      state.actions.forEach(f => this[f]());
    }
  };

  transition = (eventType, extState) => {
    const newState = stateMachine.transition(
      this.state.machine.value,
      eventType,
      {
        state: this.state
      }
    );

    console.log("new state", this.state);

    this.runActions(newState);

    this.setState({
      machine: newState,
      msg: extState && extState.msg ? extState.msg : ""
    });
  };

  handleInput = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  formSubmit = e => {
    e.preventDefault();
    this.transition("SUBMIT");
  };

  render() {
    return (
      <div style={styles.formContainer}>
        <div style={styles.formHeader}>
          <h2>State Machine Payment Form</h2>
        </div>

        <div style={styles.formBody}>
          <form>
            <div>
              <label htmlFor="NameOnCard" style={styles.label}>
                Name on card
              </label>
              <input
                id="NameOnCard"
                type="text"
                name="name"
                onChange={this.handleInput}
                value={this.state.name}
                style={styles.input}
              />
            </div>
            <div>
              <label htmlFor="CreditCardNumber" style={styles.label}>
                Card number
              </label>
              <input
                id="CreditCardNumber"
                name="card"
                type="text"
                style={styles.input}
                onChange={this.handleInput}
                value={this.state.card}
              />
            </div>
            <button
              type="submit"
              style={styles.button}
              onClick={this.formSubmit}
            >
              <span className="submit-button-lock" />
              <span className="align-middle">Pay Now</span>
            </button>
          </form>
        </div>
      </div>
    );
  }
}

const styles = {
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 4,
    boxShadow: "0 2px 4px rgba(0,0,0,0.125)"
  },
  formHeader: {
    padding: "1.75rem",
    paddingBottom: 0
  },
  formBody: {
    padding: "1.75rem"
  },
  label: {
    display: "block",
    marginBottom: 4,
    width: "100%"
  },
  input: {
    display: "block",
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
    boxShadow: "none",
    border: "1px solid #A4B6C0",
    width: "100%"
  },
  button: {
    margin: "1.75rem auto 0",
    display: "block",
    cursor: "pointer",
    padding: "12px 20px",
    backgroundColor: "#A6E9DC",
    border: 0,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: "#004C4A"
  }
};

export default PaymentForm;
