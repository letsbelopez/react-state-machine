import React from "react";
import ReactDOM from "react-dom";

import PaymentForm from "./components/PaymentForm";

import "./styles.css";

function App() {
  return (
    <div>
      <h1>Welcome to State Machines</h1>
      <PaymentForm />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
