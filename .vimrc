"" status line colors
"function! InsertStatuslineColor(mode)
"  if a:mode =='i'
"    hi statusline guibg=magenta
"  elseif a:mode == 'r'
"    hi statusline guibg=blue
"  else
"    hi statusline guibg=blue
"  endif
"endfunction
"
"au InsertEnter * call InsertStatuslineColor(v:insertmode)
"au InsertChange * call InsertStatuslineColor(v:insertmode)
"au InsertLeave * hi statusline guibg=green

" default the statusline to green
hi statusline guibg=green

" preserve words when wrapping
set lbr

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
