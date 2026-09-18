"use client";
import useFetchDashboard from "./_hooks/useFetchDashboard";

const DashBoard = () => {
  const { data, fetching, error } = useFetchDashboard();
  console.log({ data });
  if (fetching || !data) {
    return <span>...fetching</span>;
  }
  if (error) {
    console.log(error);
    // do something eventually. NOt sure what just yet. Log to some service to track?
  }

  return <div>Test</div>;
};

export default DashBoard;
