import Vue from 'vue'
import Router from 'vue-router'
import { sendTokenToBackend } from './api-methods'

import Login from '../components/Login'
import HelloWorld from '../components/HelloWorld'
import PostEdit from '../components/PostEdit'
import TextContent from '../components/TextContent'

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
