#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "pipe.h"

int g_ShowWindow;

void PipeStruct::Open() 
{
	DWORD dwMode;

	hInput = GetStdHandle(STD_INPUT_HANDLE);
	hOutput = GetStdHandle(STD_OUTPUT_HANDLE);
	bConsole = GetConsoleMode(hInput, &dwMode);
	SetConsoleMode(hInput, dwMode & ~(ENABLE_MOUSE_INPUT | ENABLE_WINDOW_INPUT));
	FlushConsoleInputBuffer(hInput);
	nReadEnd = 0;
}

void PipeStruct::Close(void) const {
	CloseHandle(hInput);
	CloseHandle(hOutput);
}

void PipeStruct::ReadInput(void) {
	DWORD dwBytes;
	ReadFile(hInput, szBuffer, LINE_INPUT_MAX_CHAR - nReadEnd, &dwBytes, NULL);
	nReadEnd += dwBytes;
}

BOOL PipeStruct::CheckInput(void) 
{
	DWORD dwEvents=0;
	char Buff[1024];
	if(g_ShowWindow)
	{
		GetNumberOfConsoleInputEvents(hInput, &dwEvents);
		if (dwEvents > 1) 
			return TRUE;
		else 
			return FALSE;
	}
	else
	{
		if(PeekNamedPipe(hInput,Buff,1024,&dwEvents,0,0))
		{
			if (dwEvents ) 
				return TRUE;
			else 
				return FALSE;
		}
		else
			return FALSE;
	}
}

void PipeStruct::LineOutput(const char *szLineStr) const {
	DWORD dwBytes;
	int nStrLen;
	char szWriteBuffer[LINE_INPUT_MAX_CHAR];
	nStrLen = strlen(szLineStr);
	memcpy(szWriteBuffer, szLineStr, nStrLen);
	szWriteBuffer[nStrLen] = '\r';
	szWriteBuffer[nStrLen + 1] = '\n';
	WriteFile(hOutput, szWriteBuffer, nStrLen + 2, &dwBytes, NULL);
}

BOOL PipeStruct::GetBuffer(char *szLineStr) 
{
	char *lpFeedEnd;
	int nFeedEnd;
	lpFeedEnd = (char *) memchr(szBuffer, '\n', nReadEnd);
	if (lpFeedEnd == NULL) 
		return FALSE;
	else 
	{
		nFeedEnd = lpFeedEnd - szBuffer;
		memcpy(szLineStr, szBuffer, nFeedEnd);
		if (szLineStr[nFeedEnd - 1] == '\r') 
			szLineStr[nFeedEnd - 1] = '\0';
		else
			szLineStr[nFeedEnd] = '\0';
	
		nFeedEnd ++;
		nReadEnd -= nFeedEnd;
		memcpy(szBuffer, szBuffer + nFeedEnd, nReadEnd);
		return TRUE;
	}
}

BOOL PipeStruct::LineInput(char *szLineStr) 
{
//	if(CheckInput())
//	{
//		scanf("%[^\n]",szLineStr);
//		fflush(stdin);
//		printf("%s\n",szLineStr);
//		fflush(stdout);
//		return TRUE;
//	}
//	else
//		return FALSE;

	if (GetBuffer(szLineStr)) 
		return TRUE;

	if (CheckInput()) 
	{
		ReadInput();
		if (GetBuffer(szLineStr)) 
		{
			return TRUE;
		} 
		else 
		{
			if (nReadEnd == LINE_INPUT_MAX_CHAR) 
			{
				memcpy(szLineStr, szBuffer, LINE_INPUT_MAX_CHAR - 1);
				szLineStr[LINE_INPUT_MAX_CHAR - 1] = '\0';
				szBuffer[0] = szBuffer[LINE_INPUT_MAX_CHAR - 1];
				nReadEnd = 1;
				return TRUE;
			} 
			else 
			{
				return FALSE;
			}
		}
	} 
	else 
	{
		return FALSE;
	}

}
