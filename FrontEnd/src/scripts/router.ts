import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Exercise from "../pages/Exercise.vue";
import { useSessionStore } from "../scripts/store";

export enum URL {
  HOME = "/home",
  LOGIN = "/login",
  ERROR = "/error",
}

export enum ROUTE {
  HOME = "home",
  LOGIN = "login",
  ERROR = "error",
}

const HomeRoute: RouteRecordRaw = {
  path: URL.HOME,
  name: ROUTE.HOME,
  component: Home,
  meta: { requiresLogin: true },
  children: [
    {
      path: "/exercise",
      component: Exercise,
    },
  ],
};

const LoginRoute: RouteRecordRaw = {
  path: URL.LOGIN,
  name: ROUTE.LOGIN,
  component: Login,
};

const RedirectRoute: RouteRecordRaw = {
  path: "/:pathMatch(.*)*",
  redirect: URL.LOGIN,
};

const routes: RouteRecordRaw[] = [HomeRoute, LoginRoute, RedirectRoute];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const sessionStore = useSessionStore();
  console.log(to.path);
  if (to.path === URL.LOGIN && !!sessionStore.userData) {
    next(URL.HOME);
    return;
  }
  if (to.meta.requiresLogin) {
    console.log(sessionStore.userData);
  }

  if (to.meta.requiresLogin && !sessionStore.userData) {
    console.log("NON SEI LOGGATO");
    next(URL.LOGIN);
    return;
  }

  next();
});

export { router };
