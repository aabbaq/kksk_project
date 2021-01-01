import Vue from 'vue'
import Router from 'vue-router'
import { sendTokenToBackend } from './api-methods'

import Login from '../components/Login'
import HelloWorld from '../components/HelloWorld'
import PostEdit from '../components/PostEdit'
import TextContent from '../components/TextContent'
import UserHome from '../components/UserHome'
import UserSelf from '../components/usercomponents/UserSelf.vue'
import UserTexts from '../components/usercomponents/UserTexts.vue'
import UserOthers from '../components/usercomponents/UserOthers.vue'
import UserNews from '../components/usercomponents/UserNews.vue'

Vue.use(Router)
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'helloworld',
      component: HelloWorld,
      meta: {
        title: 'HelloWorld'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'Login'
      }
    },
    {
      path: '/post',
      name: 'post',
      component: PostEdit,
      meta: {
        title: 'PostEdit',
        needAuthorization: true
      }
    },
    {
      path: '/content',
      name: 'content',
      component: TextContent,
      meta: {
        title: 'TextContent'
      }
    },
    {
      path: '/user',
      name: 'user',
      component: UserHome,
      meta: {
        title: 'UserHome',
        needAuthorization: true
      },
      children: [
        {
          path: '',
          name: 'userdefault',
          component: UserSelf
        },
        {
          path: 'myself',
          name: 'userself',
          component: UserSelf,
          meta: {
            title: 'UserSelf'
          }
        },
        {
          path: 'texts',
          name: 'usertexts',
          component: UserTexts,
          meta: {
            title: 'UserTexts'
          }
        },
        {
          path: 'others',
          name: 'userothers',
          component: UserOthers,
          meta: {
            title: 'UserOthers'
          }
        },
        {
          path: 'news',
          name: 'usernews',
          component: UserNews,
          meta: {
            title: 'UserNews'
          }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // let tmp_token = sessionStorage.getItem('session_authorization')
  if (to.matched.some(record => record.meta.needAuthorization)) {
    var token = sessionStorage.getItem('session_authorization')
    if (!token) {
      console.log('Not Login')
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    } else {
      sendTokenToBackend(token)
      next()
    }
  } else {
    next()
  }
})

export default router
