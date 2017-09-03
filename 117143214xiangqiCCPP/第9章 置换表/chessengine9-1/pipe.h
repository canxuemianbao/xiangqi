#include <windows.h>

#ifndef PIPE_H
#define PIPE_H

const int LINE_INPUT_MAX_CHAR = 1024;

struct PipeStruct {
	HANDLE hInput, hOutput;
	BOOL bConsole;
	int nReadEnd;
	char szBuffer[LINE_INPUT_MAX_CHAR];
	
	void Open();
	void Close(void) const;
	void ReadInput(void);
	BOOL CheckInput(void);
	BOOL GetBuffer(char *szLineStr);
	BOOL LineInput(char *szLineStr);
	void LineOutput(const char *szLineStr) const;
}; // pipe

extern int g_ShowWindow;
#endif
