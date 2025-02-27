import React from "react";
import { useParams } from "react-router-dom";

const StudyPlanOpened = () => {
  const { plan_id } = useParams();
  return (
    <div>
      StudyPlanOpened
      {plan_id}
    </div>
  );
};

export default StudyPlanOpened;
