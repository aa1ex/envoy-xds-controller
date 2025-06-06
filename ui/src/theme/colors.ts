const tokens = (mode: string) => ({
	...(mode === 'dark'
		? {
				primary: {
					DEFAULT: '#181923', // фон страницы
					100: '#2A2B36', // блок меню(не активное) и топ бар и бордер
					200: '#373843', // блок меню(активное)
					300: '#282932', // шапка карточки
					400: '#3F4048', // подложка карточки/блока
					500: '#000000',
					600: '#F9F9F9',
					700: '#3F4048',
					800: '#24252E',
					900: '#ffffff14'
				},
				secondary: {
					DEFAULT: '#292B36', // блок меню
					100: '#212130', // блок лого
					200: '#21212B', // раскрытый блок меню
					300: '#292B36', // топ бар
					400: '#4A4B53' // инпут формы
				},
				white: {
					DEFAULT: '#FFFFFF',
					100: '#F7F7F7', // цвет шрифта в каточке
					200: '#D1D1D1'
				},
				gray: {
					DEFAULT: '#A7A7A7',
					50: '#515151',
					100: '#B1B7C1',
					200: '#E4E4E4', // цвет шрифта в меню активный
					300: '#D0D0D0',
					400: '#B1B1B5', // цвет шрифта в меню не активный
					500: '#8B8B8B',
					600: '#3F4048',
					700: '#E8E8E9', // цвет текста в форме
					800: '#E8E8E9' // цвет текста в форме боди
				},
				blue: {
					DEFAULT: '#66B2FF', // кнопка не активная
					50: '#2E96FF', // кнопка активная
					100: '#06AED4', // статус синий
					200: '#321FDB',
					300: '#12009D',
					400: '#0C0065'
				},
				orange: '#D5A439',
				green: '#519668',
				red: '#C77171'
			}
		: {
				primary: {
					DEFAULT: '#EBEDEF', // фон страницы
					100: '#3C4B64', // блок меню(не активное) и топ бар и бордер
					200: '#47556D', // блок меню(активное)
					300: '#F8F8F9', // шапка карточки
					400: '#FFFFFF', // подложка карточки/блока
					500: '#000000',
					600: '#2C2C2C',
					700: '#F9FAFA',
					800: '#FFFFFF',
					900: '#0000000a'
				},
				secondary: {
					DEFAULT: '#3C4B64', // блок меню
					100: '#303C55', // блок лого
					200: '#303C51', // раскрытый блок меню
					300: '#FFFFFF', //топ бар
					400: '#FFFFFF' // инпут формы
				},
				white: {
					DEFAULT: '#FFFFFF', // блок меню и топ бар и бордер, подложка карточки/блока
					100: '#F7F7F7',
					200: '#D1D1D1'
				},
				gray: {
					DEFAULT: '#A7A7A7',
					50: '#E1E1E1',
					100: '#777E89',
					200: '#E4E4E4', // цвет шрифта в меню активный
					300: '#D0D0D0',
					400: '#B1B1B5', // цвет шрифта в меню не активный
					500: '#8B8B8B',
					600: '#3F4048',
					700: '#394555', // цвет текста в форме заголовок
					800: '#384354' // цвет текста в форме боди
				},
				blue: {
					DEFAULT: '#6366F1', // кнопка не активная
					50: '#4338CA', // кнопка активная
					100: '#06AED4', // статус синий
					200: '#321FDB',
					300: '#12009D',
					400: '#0C0065'
				},
				orange: '#F9B114',
				green: '#32B85C',
				red: '#E55353',
				error: '#E55353'
			})
})

export default tokens
