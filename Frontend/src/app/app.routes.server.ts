import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dynamic routes → must be Client rendered (runtime data)
  { path: 'user/interview/:id',        renderMode: RenderMode.Client },
  { path: 'user/interview/:id/resume', renderMode: RenderMode.Client },

  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
