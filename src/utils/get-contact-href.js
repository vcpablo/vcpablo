// @flow strict
const getContactHref = (name: string, contact: string) => {
  let href;

  switch (name) {
    case 'twitter':
      href = `https://twitter.com/${contact}`;
      break;
    case 'github':
      href = `https://github.com/${contact}`;
      break;
    case 'vkontakte':
      href = `https://vk.com/${contact}`;
      break;
    case 'telegram':
      href = `https://t.me/${contact}`;
      break;
    case 'email':
      href = `mailto:${contact}`;
      break;
    case 'linkedin':
      href = `https://linkedin.com/in/${contact}`;
      break;
    case 'instagram':
      href = `https://instagram.com/${contact}`;
      break;
    case 'line':
      href = `line://ti/p/${contact}`;
      break;
    case 'facebook':
      href = `https://facebook.com/${contact}`;
      break;
    case 'gitlab':
      href = `https://gitlab.com/${contact}`;
      break;
    case 'weibo':
      href = `https://weibo.com/${contact}`;
      break;
    case 'codepen':
      href = `https://codepen.io/${contact}`;
      break;
    case 'youtube':
      href = `https://youtube.com/channel/${contact}`;
      break;
    case 'soundcloud':
      href = `https://soundcloud.com/${contact}`;
      break;
    case 'medium':
      href = `https://${contact}.medium.com`;
      break;
    case 'dev':
      href = `https://dev.to/${contact}`;
      break;
    default:
      href = contact;
      break;
  }

  return href;
};

export default getContactHref;
