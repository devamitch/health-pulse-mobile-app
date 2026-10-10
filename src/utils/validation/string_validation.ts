const checkName = (value: string) => {
    const condition = new RegExp(/^[A-Za-z ]+$/);
    return condition.test(value);
  };
  
  const checkMobileNumber = (value: string) => {
    const condition = new RegExp(/^\d{10}$/);
    return condition.test(value);
  };
  
  const checkEmail = (value: string) => {
    const condition = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    return condition.test(value);
  };
  
  const checkNumeric = (value: string) => {
    const condition = new RegExp(/^[0-9]+$/);
    return condition.test(value);
  };
  
  export {checkName, checkMobileNumber, checkEmail, checkNumeric};
  