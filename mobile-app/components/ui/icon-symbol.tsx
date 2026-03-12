// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  // Core navigation icons
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
  'paperplane': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'plus.circle.fill': 'add-circle',
  'plus.circle': 'add-circle',
  'plus': 'add',
  'doc.text.fill': 'description',
  'doc.text': 'description',
  'doc': 'article',
  'doc.fill': 'article',
  'bell.fill': 'notifications',
  'bell': 'notifications',
  'bell.badge': 'notifications-active',
  'bell.slash': 'notifications-off',
  'person.fill': 'person',
  'person': 'person',
  'person.outline': 'person-outline',
  'person.crop.circle': 'account-circle',
  'person.crop.circle.fill': 'account-circle',
  'person.2': 'people',
  'person.2.fill': 'people',
  
  // Communication icons
  'mail': 'email',
  'envelope': 'email',
  'envelope.fill': 'email',
  'phone': 'phone',
  'phone.fill': 'phone',
  'mobile': 'phone-iphone',
  'phone.outline': 'phone-disabled',
  'chat': 'chat',
  'chat.bubble': 'chat-bubble-outline',
  'chat.bubble.fill': 'chat-bubble',
  'comment': 'comment',
  'comment.fill': 'comment',
  'message': 'message',
  'message.fill': 'message',
  'plus.message': 'message',
  
  // Settings & utility icons
  'settings': 'settings',
  'gear': 'settings',
  'gear.fill': 'settings',
  'lock': 'lock',
  'lock.fill': 'lock',
  'help': 'help',
  'help.fill': 'help',
  'question': 'help-outline',
  'questionmark.circle': 'help-outline',
  'questionmark.circle.fill': 'help',
  'info': 'info',
  'info.fill': 'info',
  'info.circle': 'info-outline',
  'info.circle.fill': 'info',
  'warning': 'warning',
  'exclamationmark.triangle': 'warning',
  'exclamationmark.triangle.fill': 'warning',
  'error': 'error',
  'exclamationmark.circle': 'error',
  'exclamationmark.circle.fill': 'error',
  
  // Time & status icons
  'clock': 'access-time',
  'hourglass': 'hourglass-empty',
  'hourglass.fill': 'hourglass-full',
  'calendar': 'calendar-today',
  'calendar.badge.clock': 'event',
  'check': 'check-circle',
  'check.fill': 'check-circle',
  'checkmark.circle.fill': 'check-circle',
  'xmark': 'close',
  'xmark.circle': 'cancel',
  'xmark.circle.fill': 'cancel',
  'close': 'close',
  
  // File & document icons
  'file': 'insert-drive-file',
  'folder': 'folder',
  'folder.fill': 'folder',
  'archivebox': 'archive',
  'archivebox.fill': 'archive',
  'tray': 'inbox',
  'tray.fill': 'inbox',
  'doc.on.doc': 'content-copy',
  'paperclip': 'attach-file',
  'clipboard': 'assignment',
  'clipboard.fill': 'assignment',
  
  // Security icons
  'shield': 'security',
  'shield.fill': 'security',
  'shield.checkered': 'verified-user',
  'checkmark.seal': 'verified',
  'checkmark.seal.fill': 'verified',
  
  // Media & capture icons
  'camera': 'photo-camera',
  'camera.fill': 'photo-camera',
  'photo': 'photo',
  'eye': 'visibility',
  'eye.fill': 'visibility',
  'location': 'location-on',
  'location.fill': 'location-on',
  'mappin': 'place',
  'mappin.circle': 'add-location',
  'globe': 'language',
  'globe.fill': 'language',
  
  // Rating & favorite icons
  'star': 'star',
  'star.fill': 'star',
  'star.circle': 'star-rate',
  'star.circle.fill': 'star-rate',
  'heart': 'favorite-border',
  'heart.fill': 'favorite',
  'favorite': 'favorite',
  'favorite.fill': 'favorite',
  'hand.thumbsup': 'thumb-up',
  'hand.thumbsup.fill': 'thumb-up',
  'hand.thumbsdown': 'thumb-down',
  'hand.thumbsdown.fill': 'thumb-down',
  
  // Action icons
  'trash': 'delete',
  'trash.fill': 'delete',
  'edit': 'edit',
  'pencil': 'edit',
  'square.and.pencil': 'edit',
  'flag': 'flag',
  'flag.fill': 'flag',
  'bookmark': 'bookmark',
  'bookmark.fill': 'bookmark',
  'share': 'share',
  'square.and.arrow.up': 'share',
  'square.and.arrow.down': 'download',
  'download': 'download',
  'upload': 'upload',
  'print': 'print',
  'link': 'link',
  'link.circle': 'link',
  'send': 'send',
  'refresh': 'refresh',
  'arrow.counterclockwise': 'refresh',
  'arrow.clockwise': 'refresh',
  
  // Navigation arrows
  'arrow.right': 'arrow-forward',
  'arrow.left': 'arrow-back',
  'arrow.down': 'arrow-drop-down',
  'arrow.up': 'arrow-drop-up',
  'arrow.uturn.backward': 'undo',
  'arrow.uturn.forward': 'redo',
  
  // Misc icons
  'menu': 'menu',
  'filter': 'filter-list',
  'sort': 'sort',
  'list': 'list',
  'list.fill': 'list',
  'list.bullet': 'format-list-bulleted',
  'list.number': 'format-list-numbered',
  'search': 'search',
  'magnifyingglass': 'search',
  'attachment': 'attach-file',
  'printer': 'print',
  'door': 'exit-to-app',
  'door.fill': 'exit-to-app',
  
  // Work & education
  'school': 'school',
  'graduationcap': 'school',
  'graduationcap.fill': 'school',
  'business': 'business',
  'building.2': 'business',
  'building.2.fill': 'business',
  'briefcase': 'work',
  'briefcase.fill': 'work',
  'work': 'work',
  'account': 'account-circle',
  'account.fill': 'account-circle',
  'group': 'group',
  'group.fill': 'group',
  
  // Charts
  'chart.bar': 'bar-chart',
  'chart.bar.fill': 'bar-chart',
  
  // Shape icons
  'ellipsis': 'more-horiz',
  'ellipsis.circle': 'more-vert',
  'minus.circle': 'remove-circle-outline',
  'square': 'crop-square',
  'circle': 'radio-button-unchecked',
  'circle.fill': 'radio-button-checked',
  'triangle': 'change-history',
  'triangle.fill': 'change-history',
  'hexagon': 'hexagon',
  'hexagon.fill': 'hexagon',
  'square.split.2x2': 'grid-view',
  
  // Text alignment
  'text.alignleft': 'format-align-left',
  'text.aligncenter': 'format-align-center',
  'text.alignright': 'format-align-right',
  'text.justify': 'format-align-justify',
  
  // Misc
  'rectangle.portrait.and.arrow.right': 'forward',
  'book': 'menu-book',
  'book.fill': 'menu-book',
  'clock.fill': 'access-time',
  'checkmark': 'check',
  'bubble.left.fill': 'chat-bubble',
  'building.columns': 'account-balance',
  'building.columns.fill': 'account-balance',
  'video': 'videocam',
  'headphones': 'headphones',
  'sun': 'wb-sunny',
  'moon': 'nights-stay',
  'cloud': 'wb-cloudy',
  'routing': 'call-split',
  'sos': 'sos',
  'sparkles': 'auto-awesome',
  'lightbulb.fill': 'lightbulb',
  'waveform': 'graphic-eq',
  'person.3.fill': 'groups',
  'hand.raised.fill': 'back-hand',
  'figure.walk': 'directions-walk',
  'arrow.right.circle.fill': 'arrow-forward',
  'cross.circle.fill': 'add-circle',
  'shield.person.fill': 'verified-user',
  'stethoscope': 'medical-services',
  'brain.head.profile': 'psychology',
  
  // Counseling & Support
  'counseling': 'psychology',
  'psychology': 'psychology',
  'support': 'support-agent',
  'support.fill': 'support-agent',
  
  // Additional missing icons for dashboard
  'assignment': 'assignment',
  'schedule': 'schedule',
  'visibility': 'visibility',
  'visibility-off': 'visibility-off',
  'check-circle': 'check-circle',
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',
  'restaurant': 'restaurant',
  'local-parking': 'local-parking',
  'edit-note': 'edit-note',
  'add-circle': 'add-circle',
  'logout': 'logout',
  'history': 'history',
  'badge': 'badge',
  'wifi': 'wifi',
  'cancel': 'cancel',
  'smart-toy': 'smart-toy',
  'more-vert': 'more-vert',
  'emergency': 'emergency',
  'event-available': 'event-available',
  'self-improvement': 'self-improvement',
  'air': 'air',
  'bedtime': 'bedtime',
  'menu-book': 'menu-book',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
