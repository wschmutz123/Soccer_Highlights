import React from "react";

const ErrorModal = (props) => {
  return (
    <modal>
      <p>{props.error}</p>
    </modal>
  );
};

export default ErrorModal;
