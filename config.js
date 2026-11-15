
(function () {
  const LOCAL_API_BASE = "http://localhost:3000";

  const DEPLOYED_API_BASE =
    "https://employee-dashboard-again.onrender.com";

  const hostname = window.location.hostname;

  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  window.JEEBLY_API_BASE = isLocal
    ? LOCAL_API_BASE
    : DEPLOYED_API_BASE;

  window.getEmployeesApiUrl = function () {
    return window.JEEBLY_API_BASE + "/employees";
  };

  console.log(
    "Jeebly API Connected URL:",
    window.getEmployeesApiUrl()
  );
})();
