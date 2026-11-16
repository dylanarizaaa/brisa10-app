import { useMutation } from '@tanstack/react-query';

import { toast } from '@/components/shared/toast';

import { signIn, signOut } from '../services/auth-service';

export function useSignIn() {
  return useMutation({ mutationFn: signIn });
}

export function useSignOut() {
  return useMutation({
    mutationFn: signOut,
    onError: (error) => toast.error(error.message),
  });
}
