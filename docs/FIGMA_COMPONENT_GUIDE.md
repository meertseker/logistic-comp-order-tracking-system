# Figma'ya Component Aktarma Rehberi

Bu dokümantasyon, Sekersoft projesindeki temel componentleri Figma'ya nasıl aktaracağınızı açıklar.

## 📋 İçindekiler

1. [Tasarım Token'ları](#tasarım-tokenları)
2. [Component Listesi](#component-listesi)
3. [Figma'ya Aktarma Yöntemleri](#figmaya-aktarma-yöntemleri)
4. [Component Detayları](#component-detayları)

---

## 🎨 Tasarım Token'ları

### Renkler (Colors)

#### Primary Colors
```
Primary Blue: #0A84FF
Primary Blue Light: #64D2FF
Primary Blue Dark: #007AFF
```

#### System Colors (iOS Style)
```
Success: #30D158
Warning: #FF9F0A
Error: #FF453A
Info: #64D2FF
```

#### Background Colors
```
Background Primary: #000000
Background Secondary: #1C1C1E
Background Tertiary: #2C2C2E
Background Elevated: #3A3A3C
Glass Card: rgba(28, 28, 30, 0.68)
Glass Strong: rgba(28, 28, 30, 0.85)
```

#### Text Colors
```
Text Primary: #FFFFFF
Text Secondary: rgba(235, 235, 245, 0.6)
Text Tertiary: rgba(235, 235, 245, 0.3)
Text Quaternary: rgba(235, 235, 245, 0.18)
```

#### Border Colors
```
Border Default: rgba(84, 84, 88, 0.35)
Border Focus: rgba(10, 132, 255, 0.5)
Border Error: rgba(255, 69, 58, 0.5)
Border Separator: rgba(84, 84, 88, 0.65)
```

#### Status Colors
```
Blue: #0A84FF (rgba(10, 132, 255, 0.15) bg)
Green: #30D158 (rgba(48, 209, 88, 0.15) bg)
Red: #FF453A (rgba(255, 69, 58, 0.15) bg)
Yellow: #FFD60A (rgba(255, 214, 10, 0.15) bg)
Purple: #BF5AF2 (rgba(191, 90, 242, 0.15) bg)
Orange: #FF9F0A (rgba(255, 159, 10, 0.15) bg)
```

### Typography

#### Font Family
```
Primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto'
Monospace: source-code-pro, Menlo, Monaco, Consolas, 'Courier New'
```

#### Font Sizes
```
xs: 11px (0.6875rem)
sm: 14px (0.875rem)
base: 16px (1rem)
lg: 18px (1.125rem)
xl: 20px (1.25rem)
2xl: 24px (1.5rem)
3xl: 30px (1.875rem)
```

#### Font Weights
```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

### Spacing

```
2: 8px (0.5rem)
3: 12px (0.75rem)
4: 16px (1rem)
5: 20px (1.25rem)
6: 24px (1.5rem)
8: 32px (2rem)
```

### Border Radius

```
sm: 8px
base: 12px
lg: 16px
xl: 20px
2xl: 24px
3xl: 32px
```

### Shadows

```
Glass Card: 0 4px 16px 0 rgba(0, 0, 0, 0.25)
Glass Hover: 0 8px 24px 0 rgba(0, 0, 0, 0.35)
Button Primary: 0 4px 14px 0 rgba(10, 132, 255, 0.4)
Button Hover: 0 6px 20px 0 rgba(10, 132, 255, 0.5)
```

### Effects

#### Backdrop Blur
```
Glass Effect: blur(20px) saturate(180%)
```

#### Gradients
```
Primary Button: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%)
Danger Button: linear-gradient(135deg, #FF453A 0%, #FF3B30 100%)
Success Button: linear-gradient(135deg, #30D158 0%, #34C759 100%)
```

---

## 📦 Component Listesi

### Temel Componentler

1. **Button** - `src/components/Button.tsx`
   - Variants: primary, secondary, danger, success
   - Sizes: sm, md, lg
   - States: default, hover, active, disabled

2. **Input** - `src/components/Input.tsx`
   - States: default, focus, error
   - Features: label, helper text, error message

3. **Select** - `src/components/Select.tsx`
   - States: default, focus, error
   - Features: label, options dropdown

4. **TextArea** - `src/components/TextArea.tsx`
   - States: default, focus, error
   - Features: label, helper text, error message

5. **Card** - `src/components/Card.tsx`
   - Features: title, actions, hover effect
   - Glass morphism style

6. **Modal** - `src/components/Modal.tsx`
   - Sizes: sm, md, lg, xl
   - Features: header, body, footer, backdrop

7. **StatCard** - `src/components/StatCard.tsx`
   - Colors: blue, green, red, yellow, purple, orange
   - Features: icon, value, trend indicator, subtitle

8. **Layout** - `src/components/Layout.tsx`
   - Features: sidebar navigation, header, main content
   - Responsive design

---

## 🚀 Figma'ya Aktarma Yöntemleri

### Yöntem 1: Manuel Tasarım (Önerilen)

Bu yöntem en doğru sonuçları verir ve component'lerinizi tam kontrol altında tutmanızı sağlar.

#### Adımlar:

1. **Figma'da Design System Oluşturun**
   - Figma'da yeni bir dosya oluşturun
   - "Design System" adında bir sayfa oluşturun
   - Tasarım token'larını (renkler, tipografi, spacing) buraya ekleyin

2. **Color Styles Oluşturun**
   ```
   Figma → Design → Colors → + 
   - Primary/Blue: #0A84FF
   - Success/Green: #30D158
   - Error/Red: #FF453A
   - Warning/Orange: #FF9F0A
   - Background/Primary: #000000
   - Background/Secondary: #1C1C1E
   - Text/Primary: #FFFFFF
   - Text/Secondary: rgba(235, 235, 245, 0.6)
   ```

3. **Text Styles Oluşturun**
   ```
   Figma → Design → Text → +
   - Heading/XL: SF Pro Display, Bold, 24px
   - Heading/LG: SF Pro Display, Semibold, 20px
   - Body/Base: SF Pro Display, Regular, 16px
   - Body/Small: SF Pro Display, Regular, 14px
   - Caption: SF Pro Display, Regular, 11px
   ```

4. **Component'leri Oluşturun**
   - Her component için ayrı bir Frame oluşturun
   - Variant'ları Figma Component Properties ile yönetin
   - Auto Layout kullanarak responsive yapın

### Yöntem 2: HTML/CSS Import (Sınırlı)

Figma'nın HTML import özelliği sınırlıdır ama basit componentler için kullanılabilir.

1. **HTML Export Script'i Oluşturun**
   - Component'leri HTML'e export eden bir script yazın
   - Figma → Plugins → Import from HTML

2. **Sınırlamalar**
   - Glass morphism efektleri tam olarak aktarılmaz
   - Animasyonlar aktarılmaz
   - Backdrop blur efektleri sınırlıdır

### Yöntem 3: Screenshot Referansı

Mevcut screenshot'ları referans alarak Figma'da yeniden tasarlayın.

1. **Screenshot'ları İnceleyin**
   - `screenshots/components/` klasöründeki component screenshot'larını kullanın
   - `screenshots/full-pages/` klasöründeki sayfa screenshot'larını referans alın

2. **Figma'da Trace Edin**
   - Screenshot'ı Figma'ya import edin
   - Üzerine component'leri yeniden çizin
   - Tasarım token'larını kullanarak doğru renkleri ve spacing'leri uygulayın

### Yöntem 4: Figma Plugin'leri

#### html.to.design Plugin
1. Figma → Plugins → Browse plugins
2. "html.to.design" arayın ve yükleyin
3. Component'lerinizi HTML olarak export edin
4. Plugin ile Figma'ya import edin

**Not:** Glass morphism ve backdrop blur efektleri tam olarak aktarılmaz, manuel düzenleme gerekebilir.

---

## 📐 Component Detayları

### Button Component

#### Primary Button
```
Background: linear-gradient(135deg, #0A84FF 0%, #007AFF 100%)
Text Color: #FFFFFF
Border Radius: 12px
Padding: 12px 24px (md size)
Shadow: 0 4px 14px 0 rgba(10, 132, 255, 0.4)
Font: Semibold, 16px

Hover:
Shadow: 0 6px 20px 0 rgba(10, 132, 255, 0.5)
Transform: translateY(-2px)
```

#### Secondary Button
```
Background: rgba(44, 44, 46, 0.8)
Backdrop Filter: blur(10px)
Text Color: #FFFFFF
Border: 0.5px solid rgba(84, 84, 88, 0.35)
Border Radius: 12px
Padding: 12px 24px
Shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.3)
```

#### Sizes
- Small: padding 8px 16px, font 14px
- Medium: padding 12px 24px, font 16px
- Large: padding 16px 32px, font 18px

### Input Component

```
Container:
Width: 100%
Background: rgba(44, 44, 46, 0.8)
Backdrop Filter: blur(10px)
Border: 0.5px solid rgba(84, 84, 88, 0.35)
Border Radius: 12px
Padding: 12px 16px

Focus State:
Border Color: rgba(10, 132, 255, 0.5)
Box Shadow: 0 0 0 4px rgba(10, 132, 255, 0.1)
Transform: scale(1.01)

Error State:
Border Color: rgba(255, 69, 58, 0.5)
```

### Card Component

```
Background: rgba(28, 28, 30, 0.68)
Backdrop Filter: blur(20px) saturate(180%)
Border: 0.5px solid rgba(255, 255, 255, 0.08)
Border Radius: 12px
Shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.25)
Padding: 24px

Hover:
Background: rgba(28, 28, 30, 0.78)
Transform: translateY(-2px)
Shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.35)
```

### StatCard Component

```
Container:
Background: rgba(28, 28, 30, 0.68)
Backdrop Filter: blur(20px)
Border: 0.5px solid [color-specific]
Border Radius: 12px
Padding: 24px

Icon Container:
Background: [color-specific with 0.15 opacity]
Border Radius: 12px
Padding: 12px
Size: 36x36px

Value:
Font: Bold, 30px
Color: #FFFFFF

Title:
Font: Medium, 11px, Uppercase
Color: rgba(235, 235, 245, 0.5)
```

### Modal Component

```
Backdrop:
Background: rgba(0, 0, 0, 0.8)
Backdrop Filter: blur(4px)

Modal Container:
Background: rgba(28, 28, 30, 0.85)
Backdrop Filter: blur(20px) saturate(180%)
Border: 0.5px solid rgba(255, 255, 255, 0.1)
Border Radius: 16px
Shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.3)

Sizes:
- sm: max-width 448px
- md: max-width 512px
- lg: max-width 672px
- xl: max-width 896px
```

### Layout Component

#### Sidebar
```
Width: 320px
Background: rgba(28, 28, 30, 0.68)
Backdrop Filter: blur(20px)
Border Radius: 24px (outer container)
Padding: 16px
```

#### Navigation Item
```
Active State:
Background: rgba(10, 132, 255, 0.12)
Border: 0.5px solid rgba(10, 132, 255, 0.3)
Shadow: 0 4px 12px rgba(10, 132, 255, 0.15)

Hover State:
Background: rgba(255, 255, 255, 0.05)
Transform: translateX(4px) scale(1.02)
```

---

## 🎯 Hızlı Başlangıç Checklist

- [ ] Figma dosyası oluştur
- [ ] Design System sayfası oluştur
- [ ] Color Styles ekle (Primary, System, Background, Text, Border)
- [ ] Text Styles ekle (Heading, Body, Caption)
- [ ] Component sayfası oluştur
- [ ] Button component'i oluştur (tüm variant'lar)
- [ ] Input component'i oluştur (tüm state'ler)
- [ ] Select component'i oluştur
- [ ] TextArea component'i oluştur
- [ ] Card component'i oluştur
- [ ] Modal component'i oluştur (tüm size'lar)
- [ ] StatCard component'i oluştur (tüm renkler)
- [ ] Layout component'i oluştur (Sidebar, Header, Content)

---

## 📝 Notlar

1. **Glass Morphism Efektleri**: Figma'da backdrop blur efektleri tam olarak CSS'teki gibi çalışmaz. Layer blur ve opacity kombinasyonları kullanın.

2. **Gradient'ler**: Button'lardaki gradient'leri Figma'da Linear Gradient olarak oluşturun.

3. **Shadows**: Figma'da multiple shadow'lar ekleyerek CSS shadow efektlerini yaklaşık olarak oluşturabilirsiniz.

4. **Auto Layout**: Tüm component'lerde Auto Layout kullanarak responsive ve tutarlı spacing sağlayın.

5. **Component Variants**: Button, Modal gibi component'lerde Figma Component Properties kullanarak variant'ları yönetin.

6. **Icons**: Lucide React icon'larını Figma'da SVG olarak import edin veya benzer icon setleri kullanın.

---

## 🔗 Yararlı Kaynaklar

- [Figma Design System Best Practices](https://www.figma.com/best-practices/)
- [Figma Component Properties](https://help.figma.com/hc/en-us/articles/5579474826519)
- [Figma Auto Layout](https://help.figma.com/hc/en-us/articles/5731387134359)

---

## 📸 Referans Screenshot'lar

Component screenshot'ları şu klasörlerde bulunmaktadır:
- `screenshots/components/` - Bireysel component screenshot'ları
- `screenshots/full-pages/` - Tam sayfa screenshot'ları

Bu screenshot'ları Figma'ya import ederek referans olarak kullanabilirsiniz.

