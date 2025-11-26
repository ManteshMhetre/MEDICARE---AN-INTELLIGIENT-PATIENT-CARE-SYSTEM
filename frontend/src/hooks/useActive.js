import { useState } from "react";

const useActive = (initState) => {
  const [active, setActive] = useState(initState);

  const handleActive = (i) => {
    setActive(i);
  };

  const activeClass = (i, activeClasses = "", inactiveClasses = "") => {
    return active === i ? activeClasses : inactiveClasses;
  };

  return { active, handleActive, activeClass };
};

export default useActive;
