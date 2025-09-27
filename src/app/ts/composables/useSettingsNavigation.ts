import { useCallback } from 'react';
import { useNavigation } from '../providers';
import { SubPath } from '../composables';

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface SettingsGroup {
  id: string;
  title: string;
  sections: SettingsSection[];
}

export const useSettingsNavigation = () => {
  const { activeSubPath, setSubPath, isActiveSubPath, navigateTo, isActiveTab } = useNavigation();

  const navigateToSettings = useCallback((subPath?: SubPath) => {
    navigateTo('settings', subPath);
  }, [navigateTo]);

  const isInSettings = useCallback(() => {
    return isActiveTab('settings');
  }, [isActiveTab]);

  const getCurrentSection = useCallback(() => {
    return activeSubPath;
  }, [activeSubPath]);

  const setActiveSection = useCallback((sectionId: string) => {
    setSubPath(sectionId);
  }, [setSubPath]);

  const isActiveSection = useCallback((sectionId: string) => {
    return isActiveSubPath(sectionId);
  }, [isActiveSubPath]);

  return {
    navigateToSettings,
    isInSettings,
    getCurrentSection,
    setActiveSection,
    isActiveSection,
    activeSubPath
  };
};