import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useUser } from '../context/UserContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { setUsername: setGlobalUsername } = useUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalUsername(username)
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Kenvue Logo */}
      <div className="w-full bg-secondary py-2 shadow-md">
        <div className="container mx-auto flex justify-start items-center px-4">
          <img src="images/kenvue-logo.png" alt="Kenvue" className="h-9" />
        </div>
      </div>

      {/* Login Content */}
      <div className={`flex-1 flex items-center justify-center ${
        isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 to-white'
      } p-4 overflow-y-auto`}>
        <div className={`w-full max-w-2xl ${
          isDarkMode 
            ? 'bg-gray-800/50 border-gray-700/50' 
            : 'bg-white/50 border-gray-200/50'
        } backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 border my-4`}>
          <div className={`w-full h-12 flex items-center justify-center rounded-t-2xl ${
            isDarkMode ? 'bg-secondary' : 'bg-secondary'
          } shadow-lg relative z-10`}>
            <div className="text-textLight font-bold text-2xl">LOGIN</div>
          </div>

          <div className={`w-full p-4 sm:p-6 md:p-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <form className="space-y-4 sm:space-y-6 max-w-md mx-auto" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label htmlFor="username" className={`sm:w-24 sm:text-right ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`flex-1 px-4 py-2 border rounded-md
                      focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                      }`}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label htmlFor="password" className={`sm:w-24 sm:text-right ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`flex-1 px-4 py-2 border rounded-md
                      focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-200
                      ${isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-black'
                      }`}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-6 sm:mt-8">
                <button
                  type="submit"
                  className={`px-10 py-2.5 rounded-full text-white font-medium 
                    ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/90'}
                    transition-all duration-200 hover:shadow-lg hover:shadow-secondary/20 
                    active:scale-95`}
                >
                  Login
                </button>
              </div>
            </form>

            <div className="flex justify-center gap-3 mt-8 sm:mt-10 text-sm">
              <a href="#" className={`${isDarkMode ? 'text-primary hover:text-primary/80' : 'text-secondary hover:text-secondary/80'} transition-colors duration-200`}>
                Legal Notice
              </a>
              <span className={isDarkMode ? 'text-white/80' : 'text-gray-500'}>|</span>
              <a href="#" className={`${isDarkMode ? 'text-primary hover:text-primary/80' : 'text-secondary hover:text-secondary/80'} transition-colors duration-200`}>
                Privacy Policy
              </a>
            </div>

            <div className={`text-center mt-4 sm:mt-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Kenvue Brands LLC
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}