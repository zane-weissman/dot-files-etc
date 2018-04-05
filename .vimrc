set nocompatible              " be iMproved, required for something
filetype off
filetype plugin off
filetype indent off
filetype on                  " might break something?
filetype plugin on
filetype indent on

" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')

" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'

" The following are examples of different formats supported.
" Keep Plugin commands between vundle#begin/end.
" plugin on GitHub repo
Plugin 'tpope/vim-fugitive'
" plugin from http://vim-scripts.org/vim/scripts.html
" Plugin 'L9'
" Git plugin not hosted on GitHub
Plugin 'git://git.wincent.com/command-t.git'
" git repos on your local machine (i.e. when working on your own plugin)
"Plugin 'file:///home/gmarik/path/to/plugin'
" The sparkup vim script is in a subdirectory of this repo called vim.
" Pass the path to set the runtimepath properly.
Plugin 'rstacruz/sparkup', {'rtp': 'vim/'}
" Install L9 and avoid a Naming conflict if you've already installed a
" different version somewhere else.
" Plugin 'ascenator/L9', {'name': 'newL9'}

" All of your Plugins must be added before the following line
Plugin 'Valloric/YouCompleteMe'
Plugin 'haya14busa/incsearch.vim'
Plugin 'ying17zi/vim-live-latex-preview.git'
map / <Plug>(incsearch-forward)
map ?  <Plug>(incsearch-backward)
map g/ <Plug>(incsearch-stay)
set hlsearch
let g:incsearch#auto_nohlsearch = 1
map n  <Plug>(incsearch-nohl-n)
map N  <Plug>(incsearch-nohl-N)
map *  <Plug>(incsearch-nohl-*)
map #  <Plug>(incsearch-nohl-#)
map g* <Plug>(incsearch-nohl-g*)
map g# <Plug>(incsearch-nohl-g#)
call vundle#end()            " required
filetype plugin indent on    " required
" To ignore plugin indent changes, instead use:
"filetype plugin on
"
" Brief help
" :PluginList       - lists configured plugins
" :PluginInstall    - installs plugins; append `!` to update or just :PluginUpdate
" :PluginSearch foo - searches for foo; append `!` to refresh local cache
" :PluginClean      - confirms removal of unused plugins; append `!` to auto-approve removal
"
" see :h vundle for more details or wiki for FAQ
" Put your non-Plugin stuff after this line





" plugins
set runtimepath^=~/.vim/vim-lua/indent/lua.vim
set runtimepath^=~/.vim/vim-lua/syntax/lua.vim


" status line colors
function! InsertStatuslineColor(mode)
  if a:mode =='i'
    hi statusline ctermbg=magenta
  elseif a:mode == 'r'
    hi statusline ctermbg=blue
  else
    hi statusline ctermbg=blue
  endif
endfunction

au InsertEnter * call InsertStatuslineColor(v:insertmode)
au InsertChange * call InsertStatuslineColor(v:insertmode)
au InsertLeave * hi statusline guibg=green

" default the statusline to green
hi statusline ctermbg=green

" preserve words when wrapping
set lbr

syntax on

" auto indent
set ai
set tabstop=2
set expandtab
set backspace=indent,eol,start
set autoindent
set copyindent
set shiftwidth=2
set number
set undolevels=1000
set smartcase
set hlsearch
set incsearch

" make j and k work better
nnoremap j gj
nnoremap k gk

" get rid of annoying f1 presses
inoremap <F1> <ESC>
nnoremap <F1> <ESC>
vnoremap <F1> <ESC>

" autosave
au FocusLost * :wa

" move to new splits
nnoremap <C-w>s <C-w>s<C-w>j
nnoremap <C-w>v <C-w>v<C-w>l

" map C-hjkl to split navigation
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

set mouse=nicr
set ttymouse=xterm

nnoremap <C-s> :w<CR>

" map jj to <C-c>
inoremap jj <C-c>

" Navigating with guides
	inoremap <Space><Tab> <Esc>/<++><Enter>"_c4l
	vnoremap <Space><Tab> <Esc>/<++><Enter>"_c4l
	map <Space><Tab> <Esc>/<++><Enter>"_c4l
	inoremap ;gui <++>

" latex binds
let g:tex_flavor = "latex"

autocmd FileType tex inoremap ;eq \[\] <++><Esc>F\i
autocmd FileType tex inoremap ;ma $$ <++><Esc>F$i
autocmd FileType tex inoremap ;en \begin{enumerate}<Enter><Enter>\end{enumerate}<Enter><Enter><++><Esc>3kA\item<Space>

