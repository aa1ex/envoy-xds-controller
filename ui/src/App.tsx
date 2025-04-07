import { ThemeProvider } from '@emotion/react'
import { useAuth } from 'react-oidc-context'
import { CssBaseline } from '@mui/material'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/errorBoundary/ErrorBoundary'
import Spinner from './components/spinner/Spinner'
import Layout from './layout/layout'
import { ColorModeContext } from './theme/theme'
import useThemeMode from './utils/hooks/useThemeMode'
import { setAccessToken } from './api/axiosApiClient.ts'
import { env } from './env.ts'
import { setAuthToken } from './api/grpc/hooks/useVirtualService.ts'

const HomePage = lazy(() => import('./pages/home/Home'))
const NodeInfoPage = lazy(() => import('./pages/nodeInfo/NodeInfo'))
const AccessGroupsPage = lazy(() => import('./pages/accessGroupsPage/accessGroupsPage'))
const VirtualServicesPage = lazy(() => import('./pages/virtualServicesPage/virtualServicesPage'))
const EditVsPage = lazy(() => import('./pages/editVsPage/editVsPage'))
const CreateVsPage = lazy(() => import('./pages/createVsPage/createVsPage'))
const Page404 = lazy(() => import('./pages/page404/page404'))

function App() {
	const [theme, colorMode] = useThemeMode()

	if (env.VITE_OIDC_ENABLED === 'true') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const auth = useAuth()

		if (auth.isLoading) {
			return <div>Loading...</div>
		}

		if (auth.error) {
			return <div>Oops... {auth.error.message}</div>
		}

		if (!auth.isAuthenticated) {
			void auth.signinRedirect()
			return <div>Redirect to login...</div>
		}

		setAccessToken(auth.user?.access_token)
		setAuthToken(auth.user?.access_token)
	}

	return (
		<ColorModeContext.Provider value={colorMode}>
			<ThemeProvider theme={theme}>
				<CssBaseline enableColorScheme />
				<Suspense fallback={<Spinner />}>
					<ErrorBoundary>
						<Routes>
							<Route path='nodeIDs' element={<Layout />}>
								<Route index element={<HomePage />} />
								<Route path=':nodeID' element={<NodeInfoPage />} />
							</Route>
							{/*<Route path='virtualServices' element={<Layout />}>*/}
							{/*	<Route index element={<VirtualServicesPage />} />*/}
							{/*	<Route path=':uid' element={<EditVsPage />} />*/}
							{/*	<Route path='createVs' element={<CreateVsPage />} />*/}
							{/*</Route>*/}
							<Route path='accessGroups' element={<Layout />}>
								<Route index element={<AccessGroupsPage />} />

								<Route path=':groupId'>
									{/* 👇 Автоматический редирект на virtualServices */}
									<Route index element={<Navigate to='virtualServices' replace />} />

									<Route path='virtualServices'>
										<Route index element={<VirtualServicesPage />} />
										<Route path='createVs' element={<CreateVsPage />} />
										<Route path=':uid' element={<EditVsPage />} />
									</Route>
								</Route>
							</Route>

							<Route path='callback' element={<Navigate to='/nodeIDs' replace />} />
							<Route path='*' element={<Page404 />} />
						</Routes>
					</ErrorBoundary>
				</Suspense>
			</ThemeProvider>
		</ColorModeContext.Provider>
	)
}

export default App
