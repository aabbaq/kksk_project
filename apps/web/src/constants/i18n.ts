export type Locale = 'zh' | 'en'

export const LOCALE_STORAGE_KEY = 'lothric_locale'

type MessageTree = {
  tabs: Record<'myself' | 'texts' | 'drafts' | 'settings', string>
  topbar: { post: string; welcome: string; guestDenied: string }
  auth: {
    loginTitle: string
    registerTitle: string
    name: string
    password: string
    username: string
    nickname: string
    loginError: string
    loginSubmit: string
    registerSubmit: string
    createAccount: string
    backToLogin: string
    registerError: string
  }
  logout: {
    title: string
    quit: string
    confirmTitle: string
    confirmBody: string
  }
  profile: {
    username: string
    password: string
    passwordPlaceholder: string
    nickname: string
    biography: string
    biographyPlaceholder: string
    alias: string
    emoji: string
    save: string
    saveSuccess: string
    saveError: string
    showYourself: string
  }
  texts: {
    explore: string
    view: string
    edit: string
    delete: string
    postNew: string
    empty: string
    deleteTitle: string
    deleteBody: string
    textTypeHidden: string
    textTypeProtected: string
    textTypeNormal: string
    textTypeUnknown: string
    actionPrompt: string
  }
  drafts: {
    title: string
    untitled: string
    continueEdit: string
    delete: string
    empty: string
  }
  settings: {
    title: string
    subtitle: string
    language: string
    languageZh: string
    languageEn: string
    languageHint: string
    languageZhDesc: string
    languageEnDesc: string
    presets: string
    customColors: string
    save: string
    reset: string
    imageStorage: string
    imageStorageHint: string
    imageStorageLocal: string
    imageStorageLocalDesc: string
    imageStorageObject: string
    imageStorageObjectDesc: string
    imageStorageUnavailable: string
    imageStorageEffective: string
    imageStorageSaved: string
    imageStorageSaveError: string
  }
  editor: {
    title: string
    titleHint: string
    subtitle: string
    subtitleHint: string
    tag: string
    tagHint: string
    picture: string
    pictureHint: string
    uploadCover: string
    secretLevel: string
    secretPublic: string
    secretNormal: string
    secretSecret: string
    secretDark: string
    protected: string
    hidden: string
    protectedPassword: string
    protectedPasswordHint: string
    upload: string
    update: string
    saveDraft: string
    confirmTitle: string
    confirmBody: string
    confirmWillBe: string
    modeHidden: string
    modeProtected: string
    modeNormal: string
    modeText: string
  }
  colorLabels: Record<string, string>
}

export const messages: Record<Locale, MessageTree> = {
  zh: {
    tabs: {
      myself: '我的',
      texts: '文章',
      drafts: '草稿',
      settings: '设置'
    },
    topbar: {
      post: '写文章',
      welcome: '欢迎你！{name}！',
      guestDenied: '你不属于这里！'
    },
    auth: {
      loginTitle: '登录',
      registerTitle: '注册',
      name: '用户名',
      password: '密码',
      username: '用户名',
      nickname: '昵称',
      loginError: '用户名或密码错误！',
      loginSubmit: '点燃篝火',
      registerSubmit: '加入旅程',
      createAccount: '创建新账号',
      backToLogin: '返回登录',
      registerError: '注册失败'
    },
    logout: {
      title: '退出登录',
      quit: '退出',
      confirmTitle: '确定要退出吗？',
      confirmBody: '你将退出当前账号。'
    },
    profile: {
      username: '用户名',
      password: '密码',
      passwordPlaceholder: '想要修改密码？',
      nickname: '昵称',
      biography: '简介',
      biographyPlaceholder: '展示你自己',
      alias: '别名',
      emoji: '表情',
      save: '保存资料',
      saveSuccess: '资料已保存',
      saveError: '保存失败，请稍后重试',
      showYourself: '展示你自己'
    },
    texts: {
      explore: '查看详情',
      view: '阅读',
      edit: '编辑',
      delete: '删除',
      postNew: '写新文章',
      empty: '还没有发布任何文章。',
      deleteTitle: '删除文章',
      deleteBody: '确定要删除这篇文章吗？',
      textTypeHidden: '隐藏',
      textTypeProtected: '加密',
      textTypeNormal: '普通',
      textTypeUnknown: '未知',
      actionPrompt: '你想对这篇文章做什么？'
    },
    drafts: {
      title: '草稿箱',
      untitled: '（无标题草稿）',
      continueEdit: '继续编辑',
      delete: '删除',
      empty: '暂无草稿。'
    },
    settings: {
      title: '博客外观',
      subtitle: '选择预设配色，或单独调整各区域颜色。设置保存在本地。',
      language: '界面语言',
      languageHint: '选择博客界面的显示语言，保存后生效。',
      languageZh: '中文',
      languageZhDesc: '简体中文界面',
      languageEn: 'English',
      languageEnDesc: 'English interface',
      presets: '配色预设',
      customColors: '自定义颜色',
      save: '保存设置',
      reset: '恢复预设',
      imageStorage: '图片存储',
      imageStorageHint: '开启后新上传的封面图将保存到对象存储并引用 URL；关闭则保存到服务器本地目录（适合开发/测试）。',
      imageStorageLocal: '本地存储',
      imageStorageLocalDesc: '图片写入服务器 uploads 目录',
      imageStorageObject: '对象存储',
      imageStorageObjectDesc: '图片上传到 S3 兼容对象存储，数据库只保存 URL',
      imageStorageUnavailable: '当前环境未配置对象存储凭证，无法开启。',
      imageStorageEffective: '当前生效：{driver}',
      imageStorageSaved: '图片存储设置已保存',
      imageStorageSaveError: '图片存储设置保存失败'
    },
    editor: {
      title: '文章标题',
      titleHint: '例如：第一篇博客',
      subtitle: '副标题',
      subtitleHint: '可以填写，也可以留空',
      tag: '标签',
      tagHint: '用标签标记文章',
      picture: '封面图',
      pictureHint: '图片文件名，或在下方上传',
      uploadCover: '上传封面',
      secretLevel: '保密等级',
      secretPublic: '公开',
      secretNormal: '普通',
      secretSecret: '秘密',
      secretDark: '绝密',
      protected: '启用密码保护',
      hidden: '设为隐藏',
      protectedPassword: '保护密码',
      protectedPasswordHint: '设置密码以保护文章',
      upload: '发布',
      update: '更新',
      saveDraft: '保存草稿',
      confirmTitle: '确认操作',
      confirmBody: '请确认以下设置无误：',
      confirmWillBe: '这篇文章将被设为',
      modeHidden: '隐藏 ',
      modeProtected: '加密 ',
      modeNormal: '普通 ',
      modeText: '文章'
    },
    colorLabels: {
      pageBg: '页面背景',
      surfaceBg: '面板/卡片背景',
      articleBg: '文章背景',
      topbarBg: '顶栏背景',
      footbarBg: '页脚背景',
      tabsBg: '标签栏背景',
      buttonBg: '按钮背景'
    }
  },
  en: {
    tabs: {
      myself: 'myself',
      texts: 'texts',
      drafts: 'drafts',
      settings: 'settings'
    },
    topbar: {
      post: 'Post',
      welcome: 'Welcome, {name}!',
      guestDenied: 'You do not belong here!'
    },
    auth: {
      loginTitle: 'Login',
      registerTitle: 'Register',
      name: 'Name',
      password: 'Password',
      username: 'Username',
      nickname: 'Nickname',
      loginError: 'Wrong Password or Username!',
      loginSubmit: 'Light BonFire',
      registerSubmit: 'Join Lothric',
      createAccount: 'Create a new account',
      backToLogin: 'Back to Login',
      registerError: 'Registration failed'
    },
    logout: {
      title: 'Log Out',
      quit: 'Quit',
      confirmTitle: 'Are You Sure?',
      confirmBody: 'You will log out!'
    },
    profile: {
      username: 'Username',
      password: 'Password',
      passwordPlaceholder: 'Want to change your password?',
      nickname: 'Nickname',
      biography: 'Biography',
      biographyPlaceholder: 'Show yourself',
      alias: 'Alias',
      emoji: 'Emoji',
      save: 'Save Profile',
      saveSuccess: 'Profile saved successfully',
      saveError: 'Failed to save profile. Please try again.',
      showYourself: 'Show yourself'
    },
    texts: {
      explore: 'Explore',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      postNew: 'Post A New Text',
      empty: 'You have not posted any texts yet.',
      deleteTitle: 'Delete Text',
      deleteBody: 'Are you sure of deleting this text?',
      textTypeHidden: 'Hidden',
      textTypeProtected: 'Protected',
      textTypeNormal: 'Normal',
      textTypeUnknown: 'Unknown',
      actionPrompt: 'What do you want to do with this text?'
    },
    drafts: {
      title: 'Drafts',
      untitled: '(Untitled draft)',
      continueEdit: 'Continue Editing',
      delete: 'Delete',
      empty: 'No drafts yet.'
    },
    settings: {
      title: 'Blog Appearance',
      subtitle: 'Choose a preset or customize each surface color. Settings are saved in local storage.',
      language: 'Language',
      languageHint: 'Choose the display language for the blog interface. Takes effect after saving.',
      languageZh: '中文',
      languageZhDesc: 'Simplified Chinese',
      languageEn: 'English',
      languageEnDesc: 'English interface',
      presets: 'Color presets',
      customColors: 'Custom colors',
      save: 'Save settings',
      reset: 'Reset to preset',
      imageStorage: 'Image storage',
      imageStorageHint: 'When enabled, new cover uploads go to object storage with a URL reference. When disabled, files are stored on the server (dev/test).',
      imageStorageLocal: 'Local storage',
      imageStorageLocalDesc: 'Save images to the server uploads directory',
      imageStorageObject: 'Object storage',
      imageStorageObjectDesc: 'Upload to S3-compatible storage; only the URL is stored in the database',
      imageStorageUnavailable: 'Object storage credentials are not configured in this environment.',
      imageStorageEffective: 'Active driver: {driver}',
      imageStorageSaved: 'Image storage settings saved',
      imageStorageSaveError: 'Failed to save image storage settings'
    },
    editor: {
      title: 'Blog Title',
      titleHint: 'For example, "The first blog text"',
      subtitle: 'Blog Subtitle',
      subtitleHint: 'You can set one or not',
      tag: 'Blog Tag',
      tagHint: 'Use tag to mark the text',
      picture: 'Blog Picture',
      pictureHint: 'Image name or upload below',
      uploadCover: 'Upload cover image',
      secretLevel: 'Secret Level',
      secretPublic: 'Public',
      secretNormal: 'Normal',
      secretSecret: 'Secret',
      secretDark: 'Dark',
      protected: 'Set this text protected',
      hidden: 'Set this text hidden',
      protectedPassword: 'Protected Password',
      protectedPasswordHint: 'Set Password to protect your text',
      upload: 'Upload',
      update: 'Update',
      saveDraft: 'Save as Draft',
      confirmTitle: 'Confirm',
      confirmBody: 'Be Sure Nothing Wrong:',
      confirmWillBe: 'This text will be set as a',
      modeHidden: 'Hidden ',
      modeProtected: 'Protected ',
      modeNormal: 'Normal ',
      modeText: 'Text'
    },
    colorLabels: {
      pageBg: 'Page background',
      surfaceBg: 'Panel / card surface',
      articleBg: 'Article background',
      topbarBg: 'Top bar background',
      footbarBg: 'Footer background',
      tabsBg: 'Tabs background',
      buttonBg: 'Button background'
    }
  }
}
