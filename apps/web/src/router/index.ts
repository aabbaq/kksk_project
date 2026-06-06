import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { tokenCheck } from '@/api/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/homepage' },
    {
      path: '/homepage',
      name: 'helloworld',
      component: () => import('@/components/blog/BlogList.vue'),
      meta: { title: 'HelloWorld' }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/auth/LoginForm.vue'),
      meta: { title: 'Login' }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/components/auth/RegisterForm.vue'),
      meta: { title: 'Register' }
    },
    {
      path: '/post/:textNumber',
      name: 'post',
      component: () => import('@/components/blog/BlogEditor.vue'),
      meta: { title: 'PostEdit', needAuthorization: true }
    },
    {
      path: '/content/:textAuthor/:textTitle',
      name: 'content',
      component: () => import('@/components/blog/BlogDetail.vue'),
      meta: { title: 'TextContent' }
    },
    {
      path: '/user',
      component: () => import('@/components/user/UserLayout.vue'),
      meta: { title: 'UserHome', needAuthorization: true },
      children: [
        { path: '', name: 'user', redirect: { name: 'userself' } },
        {
          path: 'myself',
          name: 'userself',
          component: () => import('@/components/user/UserProfile.vue'),
          meta: { title: 'UserSelf' }
        },
        {
          path: 'texts',
          name: 'usertexts',
          component: () => import('@/components/user/UserTexts.vue'),
          meta: { title: 'UserTexts' }
        },
        {
          path: 'drafts',
          name: 'userdrafts',
          component: () => import('@/components/user/UserDrafts.vue'),
          meta: { title: 'UserDrafts' }
        },
        {
          path: 'settings',
          name: 'usersettings',
          component: () => import('@/components/user/UserSettings.vue'),
          meta: { title: 'UserSettings' }
        },
        {
          path: 'admin',
          name: 'useradmin',
          component: () => import('@/components/user/UserAdmin.vue'),
          meta: { title: 'UserAdmin', needAdmin: true }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  const needsAuth = to.matched.some(r => r.meta.needAuthorization)
  const needsAdmin = to.matched.some(r => r.meta.needAdmin)

  if (needsAuth && !auth.haveCheckUserToken) {
    const token = sessionStorage.getItem('session_authorization')
    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    try {
      await tokenCheck()
      auth.haveCheckUserTokenCommit()
    } catch {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  if (needsAdmin && auth.userRole !== 7) {
    next({ name: 'userself' })
    return
  }

  next()
})

export default router
