import { useState, useCallback } from 'react';
import { AppTab } from '../types/Global';

export type SubPath = string;
export type NavigationPath = `${AppTab}` | `${AppTab}/${SubPath}`;

export interface NavigationState {
  activeTab: AppTab;
  activeSubPath: SubPath | null;
  fullPath: NavigationPath;
  setActiveTab: (tab: AppTab) => void;
  navigateTo: (tab: AppTab, subPath?: SubPath) => void;
  navigateToPath: (path: NavigationPath) => void;
  isActive: (tab: AppTab, subPath?: SubPath) => boolean;
  isActiveTab: (tab: AppTab) => boolean;
  isActiveSubPath: (subPath: SubPath) => boolean;
  setSubPath: (subPath: SubPath | null) => void;
}

export const useAppNavigation = (initialTab: AppTab = 'home', initialSubPath?: SubPath): NavigationState => {
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [activeSubPath, setActiveSubPath] = useState<SubPath | null>(initialSubPath || null);

  const fullPath: NavigationPath = activeSubPath ? `${activeTab}/${activeSubPath}` : activeTab;

  const navigateTo = useCallback((tab: AppTab, subPath?: SubPath) => {
    setActiveTab(tab);
    setActiveSubPath(subPath || null);
  }, []);

  const navigateToPath = useCallback((path: NavigationPath) => {
    const [tab, subPath] = path.split('/') as [AppTab, SubPath?];
    setActiveTab(tab);
    setActiveSubPath(subPath || null);
  }, []);

  const isActive = useCallback((tab: AppTab, subPath?: SubPath) => {
    if (subPath) {
      return activeTab === tab && activeSubPath === subPath;
    }
    return activeTab === tab && (activeSubPath === null || activeSubPath === undefined);
  }, [activeTab, activeSubPath]);

  const isActiveTab = useCallback((tab: AppTab) => {
    return activeTab === tab;
  }, [activeTab]);

  const isActiveSubPath = useCallback((subPath: SubPath) => {
    return activeSubPath === subPath;
  }, [activeSubPath]);

  const setSubPath = useCallback((subPath: SubPath | null) => {
    setActiveSubPath(subPath);
  }, []);

  return {
    activeTab,
    activeSubPath,
    fullPath,
    setActiveTab,
    navigateTo,
    navigateToPath,
    isActive,
    isActiveTab,
    isActiveSubPath,
    setSubPath
  };
};