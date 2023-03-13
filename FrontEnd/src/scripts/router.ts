import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue";
import Main from "../pages/Main.vue";
import Login from "../components/Login.vue";
import PasswordRecovery from "../components/PasswordRecovery.vue";
import Exercise from "../pages/Exercise.vue";
import { useSessionStore } from "../scripts/store";

export enum URL {
  MAIN = "/main",
  HOME = "/home",
  LOGIN = "/login",
  ERROR = "/error",
  REGISTRATION = "/registration",
  NEW_PASSWORD = "/new-password",
  PASSWORD_RECOVERY = "/password-recovery",
  EXERCISE = "/exercise",
}

const HomeRoute: RouteRecordRaw = {
  path: URL.HOME,
  component: Home,
  meta: { requiresLogin: true },
  children: [
    {
      path: URL.EXERCISE,
      component: Exercise,
    },
  ],
};

const MainRoute: RouteRecordRaw = {
  path: URL.MAIN,
  component: Main,
  children: [
    {
      path: URL.LOGIN,
      component: Login,
    },
    {
      path: URL.PASSWORD_RECOVERY,
      component: PasswordRecovery,
    },
  ],
};

const RedirectRoute: RouteRecordRaw = {
  path: "/:pathMatch(.*)*",
  redirect: URL.LOGIN,
};

const routes: RouteRecordRaw[] = [HomeRoute, MainRoute, RedirectRoute];

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
