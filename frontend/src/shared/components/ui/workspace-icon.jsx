import React from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineChartBarSquare,
  HiOutlineCodeBracketSquare,
  HiOutlineFolder,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineUsers,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

export const DEFAULT_WORKSPACE_ICON = "folder";

export const WORKSPACE_ICON_OPTIONS = [
  { key: "folder", label: "Folder", Icon: HiOutlineFolder },
  { key: "briefcase", label: "Work", Icon: HiOutlineBriefcase },
  { key: "rocket", label: "Launch", Icon: HiOutlineRocketLaunch },
  { key: "code", label: "Code", Icon: HiOutlineCodeBracketSquare },
  { key: "chart", label: "Analytics", Icon: HiOutlineChartBarSquare },
  { key: "team", label: "Team", Icon: HiOutlineUsers },
  { key: "office", label: "Office", Icon: HiOutlineBuildingOffice2 },
  { key: "idea", label: "Idea", Icon: HiOutlineLightBulb },
  { key: "lab", label: "Lab", Icon: HiOutlineBeaker },
  { key: "study", label: "Study", Icon: HiOutlineAcademicCap },
  { key: "tools", label: "Tools", Icon: HiOutlineWrenchScrewdriver },
  { key: "energy", label: "Energy", Icon: HiOutlineBolt },
];

export const isWorkspaceIconKey = (value) =>
  WORKSPACE_ICON_OPTIONS.some((icon) => icon.key === value);

export const WorkspaceIcon = ({
  iconKey,
  className = "",
  size = 22,
  fallbackClassName = "",
}) => {
  const selected = WORKSPACE_ICON_OPTIONS.find((icon) => icon.key === iconKey);

  if (selected) {
    const IconComponent = selected.Icon;
    return <IconComponent size={size} className={className} />;
  }

  if (typeof iconKey === "string" && iconKey.trim()) {
    return <span className={fallbackClassName}>{iconKey}</span>;
  }

  const FallbackIcon = WORKSPACE_ICON_OPTIONS[0].Icon;
  return <FallbackIcon size={size} className={className} />;
};
