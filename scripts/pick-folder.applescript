on run argv
  set targetPath to item 1 of argv

  tell application "System Events"
    -- 等待文件选择器出现
    repeat 30 times
      if (exists window 1 of (first process whose frontmost is true)) then
        try
          tell (first process whose frontmost is true)
            if exists sheet 1 of window 1 then exit repeat
            if exists button "打开" of window 1 then exit repeat
            if exists button "Open" of window 1 then exit repeat
          end tell
        end try
      end if
      delay 0.2
    end repeat

    -- Cmd+Shift+G 打开"前往文件夹"输入框
    keystroke "g" using {command down, shift down}
    delay 0.6

    -- 输入路径
    keystroke targetPath
    delay 0.4

    -- 回车跳到该路径
    keystroke return
    delay 0.8

    -- 再回车确认选中
    keystroke return
  end tell
end run
