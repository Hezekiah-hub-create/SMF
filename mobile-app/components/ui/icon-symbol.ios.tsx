import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Add your custom icon names to SF Symbols mappings here.
 * - SF Symbols names must match exactly what's available in Apple's SF Symbols library
 * - See https://developer.apple.com/sf-symbols/ for the full list
 */
const MAPPING: Record<string, SymbolViewProps['name']> = {
  // Core navigation icons
  'house.fill': 'house.fill',
  'house': 'house',
  'paperplane.fill': 'paperplane.fill',
  'paperplane': 'paperplane',
  'chevron.left.forwardslash.chevron.right': 'chevron.left.forwardslash.chevron.right',
  'chevron.right': 'chevron.right',
  'chevron.left': 'chevron.left',
  'chevron-left': 'chevron.left',
  'chevron-right': 'chevron.right',
  'plus.circle.fill': 'plus.circle.fill',
  'plus.circle': 'plus.circle',
  'plus': 'plus',
  'doc.text.fill': 'doc.text.fill',
  'doc.text': 'doc.text',
  'doc': 'doc',
  'doc.fill': 'doc.fill',
  'bell.fill': 'bell.fill',
  'bell': 'bell',
  'bell.badge': 'bell.badge',
  'bell.slash': 'bell.slash',
  'person.fill': 'person.fill',
  'person': 'person',
  'person.outline': 'person',
  'person.crop.circle': 'person.crop.circle',
  'person.crop.circle.fill': 'person.crop.circle.fill',
  'person.2': 'person.2',
  'person.2.fill': 'person.2.fill',

  // Communication icons
  'mail': 'envelope',
  'envelope': 'envelope',
  'envelope.fill': 'envelope.fill',
  'phone': 'phone',
  'phone.fill': 'phone.fill',
  'mobile': 'iphone',
  'phone.outline': 'phone',
  'chat': 'bubble.left.and.bubble.right',
  'chat.bubble': 'bubble.left',
  'chat.bubble.fill': 'bubble.left.fill',
  'comment': 'text.bubble',
  'comment.fill': 'text.bubble.fill',
  'message': 'message',
  'message.fill': 'message.fill',
  'plus.message': 'plus.bubble',

  // Settings & utility icons
  'settings': 'gearshape',
  'gear': 'gearshape',
  'gear.fill': 'gearshape.fill',
  'lock': 'lock',
  'lock.fill': 'lock.fill',
  'help': 'questionmark.circle',
  'help.fill': 'questionmark.circle.fill',
  'question': 'questionmark',
  'questionmark.circle': 'questionmark.circle',
  'questionmark.circle.fill': 'questionmark.circle.fill',
  'info': 'info.circle',
  'info.fill': 'info.circle.fill',
  'info.circle': 'info.circle',
  'info.circle.fill': 'info.circle.fill',
  'warning': 'exclamationmark.triangle',
  'exclamationmark.triangle': 'exclamationmark.triangle',
  'exclamationmark.triangle.fill': 'exclamationmark.triangle.fill',
  'error': 'exclamationmark.circle',
  'exclamationmark.circle': 'exclamationmark.circle',
  'exclamationmark.circle.fill': 'exclamationmark.circle.fill',

  // Time & status icons
  'clock': 'clock',
  'hourglass': 'hourglass',
  'hourglass.fill': 'hourglass',
  'calendar': 'calendar',
  'calendar.badge.clock': 'calendar.badge.clock',
  'check': 'checkmark',
  'check.fill': 'checkmark',
  'checkmark.circle.fill': 'checkmark.circle.fill',
  'xmark': 'xmark',
  'xmark.circle': 'xmark.circle',
  'xmark.circle.fill': 'xmark.circle.fill',
  'close': 'xmark',

  // File & document icons
  'file': 'doc',
  'folder': 'folder',
  'folder.fill': 'folder.fill',
  'archivebox': 'archivebox',
  'archivebox.fill': 'archivebox.fill',
  'tray': 'tray',
  'tray.fill': 'tray.fill',
  'doc.on.doc': 'doc.on.doc',
  'paperclip': 'paperclip',
  'clipboard': 'doc.on.clipboard',
  'clipboard.fill': 'doc.on.clipboard.fill',

  // Security icons
  'shield': 'shield',
  'shield.fill': 'shield.fill',
  'shield.checkered': 'checkmark.shield',
  'checkmark.seal': 'checkmark.seal',
  'checkmark.seal.fill': 'checkmark.seal.fill',

  // Media & capture icons
  'camera': 'camera',
  'camera.fill': 'camera.fill',
  'photo-camera': 'camera.fill',
  'photo': 'photo',
  'eye': 'eye',
  'eye.fill': 'eye.fill',
  'location': 'location',
  'location.fill': 'location.fill',
  'mappin': 'mappin',
  'mappin.circle': 'mappin.circle',
  'globe': 'globe',
  'globe.fill': 'globe.americas.fill',

  // Rating & favorite icons
  'star': 'star',
  'star.fill': 'star.fill',
  'star.circle': 'star.circle',
  'star.circle.fill': 'star.circle.fill',
  'heart': 'heart',
  'heart.fill': 'heart.fill',
  'favorite': 'heart',
  'favorite.fill': 'heart.fill',
  'hand.thumbsup': 'hand.thumbsup',
  'hand.thumbsup.fill': 'hand.thumbsup.fill',
  'hand.thumbsdown': 'hand.thumbsdown',
  'hand.thumbsdown.fill': 'hand.thumbsdown.fill',

  // Action icons
  'trash': 'trash',
  'trash.fill': 'trash.fill',
  'edit': 'pencil',
  'pencil': 'pencil',
  'square.and.pencil': 'square.and.pencil',
  'flag': 'flag',
  'flag.fill': 'flag.fill',
  'bookmark': 'bookmark',
  'bookmark.fill': 'bookmark.fill',
  'share': 'square.and.arrow.up',
  'square.and.arrow.up': 'square.and.arrow.up',
  'square.and.arrow.down': 'square.and.arrow.down',
  'download': 'arrow.down.circle',
  'upload': 'arrow.up.circle',
  'print': 'printer',
  'link': 'link',
  'link.circle': 'link.circle',
  'send': 'paperplane',
  'send.fill': 'paperplane.fill',
  'refresh': 'arrow.clockwise',
  'arrow.counterclockwise': 'arrow.counterclockwise',
  'arrow.clockwise': 'arrow.clockwise',

  // Navigation arrows
  'arrow.right': 'arrow.right',
  'arrow.left': 'arrow.left',
  'arrow.down': 'arrow.down',
  'arrow.up': 'arrow.up',
  'arrow.uturn.backward': 'arrow.uturn.backward',
  'arrow.uturn.forward': 'arrow.uturn.forward',

  // Misc icons
  'menu': 'line.3.horizontal',
  'filter': 'line.3.horizontal.decrease.circle',
  'sort': 'arrow.up.arrow.down',
  'list': 'list.bullet',
  'list.fill': 'list.bullet',
  'list.bullet': 'list.bullet',
  'list.number': 'list.number',
  'search': 'magnifyingglass',
  'magnifyingglass': 'magnifyingglass',
  'attachment': 'paperclip',
  'printer': 'printer',
  'door': 'rectangle.portrait.and.arrow.right',
  'door.fill': 'rectangle.portrait.and.arrow.right',
  'logout': 'rectangle.portrait.and.arrow.right',

  // Work & education
  'school': 'graduationcap',
  'graduationcap': 'graduationcap',
  'graduationcap.fill': 'graduationcap.fill',
  'business': 'building.2',
  'building.2': 'building.2',
  'building.2.fill': 'building.2.fill',
  'briefcase': 'briefcase',
  'briefcase.fill': 'briefcase.fill',
  'work': 'briefcase',
  'account': 'person.crop.circle',
  'account.fill': 'person.crop.circle.fill',
  'group': 'person.3',
  'group.fill': 'person.3.fill',

  // Charts
  'chart.bar': 'chart.bar',
  'chart.bar.fill': 'chart.bar.fill',

  // Shape icons
  'ellipsis': 'ellipsis',
  'ellipsis.circle': 'ellipsis.circle',
  'minus.circle': 'minus.circle',
  'square': 'square',
  'circle': 'circle',
  'circle.fill': 'circle.fill',
  'triangle': 'triangle',
  'triangle.fill': 'triangle.fill',
  'hexagon': 'hexagon',
  'hexagon.fill': 'hexagon.fill',
  'square.split.2x2': 'square.split.2x2',

  // Text alignment
  'text.alignleft': 'text.alignleft',
  'text.aligncenter': 'text.aligncenter',
  'text.alignright': 'text.alignright',
  'text.justify': 'text.justify',

  // Misc
  'rectangle.portrait.and.arrow.right': 'rectangle.portrait.and.arrow.right',
  'book': 'book',
  'book.fill': 'book.fill',

  // Counseling & Support
  'counseling': 'brain.head.profile',
  'psychology': 'brain.head.profile',
  'support': 'person.badge.plus',
  'support.fill': 'person.badge.plus',

  // Additional icons for dashboard
  'assignment': 'doc.text',
  'schedule': 'clock',
  'visibility': 'eye',
  'visibility-off': 'eye.slash',
  'check-circle': 'checkmark.circle',
  'trending-up': 'arrow.up.right',
  'trending-down': 'arrow.down.right',
  'restaurant': 'fork.knife',
  'local-parking': 'parkingsign',
  'edit-note': 'note.text',
  'add-circle': 'plus.circle',
  'history': 'clock.arrow.circlepath',
  'badge': 'person.badge.clock',
  'wifi': 'wifi',
  'cancel': 'xmark.circle',
  'smart-toy': 'face.smiling',
  'more-vert': 'ellipsis',
  'emergency': 'exclamationmark.octagon',
  'event-available': 'checkmark.circle',
  'self-improvement': 'figure.mind.and.body',
  'air': 'wind',
  'bedtime': 'moon.fill',
  'menu-book': 'book',

  // Legacy/alternate names
  'trending_up': 'arrow.up.right',
  'trending_down': 'arrow.down.right',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: keyof typeof MAPPING;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const symbolName = MAPPING[name] || name;

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={symbolName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
