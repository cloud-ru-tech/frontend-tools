# @cloud-ru/ft-config-stylelint

## Installation
`npm i @cloud-ru/ft-config-stylelint`
>
> Вместе с пакетом приезжают все необходимые зависимости для работы `stylelint` в вашем приложении.

## Usage
```ts
// projectRoot/stylelint.config.js
module.exports = {
  extends: '@cloud-ru/ft-config-stylelint',
  //some additional rules if needed
}
```

## Важно

### z-index
Предполагается, что вам **не придётся** столкнуться со свойством z-index при следующих условиях:
1. У вас грамотная вёрстка с корректным порядком элементов
2. Вы используете компоненты из UI Kit. 

Однако, **если же вам всё же пришлось** использовать свойство z-index для настройки корректного порядка элементов по оси z, то:
1. Обратите внимание на вёрстку и перепроверьте, что иная реализация невозможна.
2. У вас сложный компонент, требующий особого решения. Некоторые случаи (например проблемы с порядком **выпадающих** элементов) можно реализовать через `React.Portal` (подробнее чуть ниже). 
3. Скорее всего только в крайнем случае z-index будет единственным (=> валидным) решением (что достаточно редко).  
  
#### Способы определения порядка DOM элементов по оси z
Определить порядок элемента по оси z можно двумя способами:
1. С помощью z-index.  
Мы **не рекомендуем использовать z-index** в стилях элементов, поскольку считаем, что этот подход в большинстве случаев является вредным костылём и приводит к ещё большему количеству костылей (в виде использования z-index) впоследствии. Особо рискованно использовать это свойство при микросервисной архитектуре – фикс/фича в одном микрофронте может негативно повлиять на корректную работу другого, и навести в этом всём порядок может быть непростой задачей (потребуется одновременная выкатка многих микросервисов с исправлениями).  
2. С помощью нативного приоритета элементов в DOM дереве.  
 
Допустим у нас есть элемент-родитель А и у него два ребёнка – B и C. Если ребёнок C находится в DOM дереве ниже соседа (С), то он будет отображаться поверх него.
```
<A>
  <B/>
  <C/>
</A>  
```

И наоборот, если ребёнок B находится в DOM дереве ниже B, то элемент B будет приоритетнее/ближе к пользователю по оси z.  
```
<A>
  <C/>
  <B/>
</A>  
```
Всё крайне просто – очерёдность элементов влияет на их порядок отображения.

##### React.Portal
Для реализации подобного подхода в React в большинстве случаев достаточно просто соблюдать корректный порядок элементов при вёрстке.  
В более сложных (но достаточно редких) ситуациях на помощь могут прийти порталы `React.Portal`. В наших UI Kit'ах все всплывающие элементы (модкалки, тултипы, дроверы, выпадающие списки и пр.) рендерятся в порталах, которые append’ятся в единый элемент – `<body>`. Благодаря этому приоритет всплывающих элементов по оси z определяется очередностью попадания этих порталов в DOM дерево. 

Советуем посмотреть видео ["Как мы решили проблемы с z-index" от АйТи Синяк](https://youtu.be/w4CPbE_efWw), иллюстрирующее данный подход.

#### Summary
1. Располагайте компоненты в верстке в правильном порядке
2. По возможности всегда используйте компоненты из UI Kit'а - они рисуются в порталах.
3. Используйте порталы напрямую, если у вас сложный кастомный компонент.
4. Используйте z-index только в самом крайнем случае, когда рекомендации выше не помогли и добиться желаемого результата не удалось.
