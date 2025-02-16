
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export function useLanguage() {
  const { i18n } = useTranslation();
  const { session } = useAuth();
  const [isChanging, setIsChanging] = useState(false);

  const changeLanguage = async (language: 'en' | 'el') => {
    setIsChanging(true);
    try {
      // Update i18n
      await i18n.changeLanguage(language);
      
      // Store in localStorage
      localStorage.setItem('language_preference', language);
      
      // Update user profile if logged in
      if (session?.user.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ language_preference: language })
          .eq('id', session.user.id);
          
        if (error) throw error;
      }
      
      toast.success(
        language === 'en' 
          ? 'Language updated successfully' 
          : 'Η γλώσσα ενημερώθηκε με επιτυχία'
      );
    } catch (error) {
      console.error('Error changing language:', error);
      toast.error(
        language === 'en'
          ? 'Failed to update language'
          : 'Αποτυχία ενημέρωσης γλώσσας'
      );
    } finally {
      setIsChanging(false);
    }
  };

  return {
    currentLanguage: i18n.language as 'en' | 'el',
    changeLanguage,
    isChanging
  };
}
