// Board.h: interface for the CBoard class.
//
//////////////////////////////////////////////////////////////////////

#if !defined(AFX_BOARD_H__F6F321A6_8261_4448_A440_7B50D85B1BAB__INCLUDED_)
#define AFX_BOARD_H__F6F321A6_8261_4448_A440_7B50D85B1BAB__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#include "def.h"
const int MaxValue = 3000;	//��ֵ���ֵ

class CBoard  
{
public:
	CBoard();
	virtual ~CBoard();


	//************************************************************************
	//                  ��������
	//************************************************************************

	int side;					// �ֵ��ķ��ߣ�0��ʾ�췽��1��ʾ�ڷ�
	unsigned char board[256];	// ��������
	unsigned char piece[48];	// ��������
	char FenString[128];		// �����FEN����ʽ

	move MoveStack[128];	// ִ�е��߷�ջ
	int StackTop;			// ջ��ָ��,ָ��ջ��Ԫ�ص���һλ��,=0��ʾջ��
	move BestMove;	//�����õ�������߷�
	int ply;		// ��ǰ�������
	int MaxDepth;	//����������

	//************************************************************************
	//                  ��������
	//************************************************************************

	
	// �����ʾ��غ���------------------------------------
	void ClearBoard();				// �����������
	void OutputBoard();				// �����������
	void OutputPiece();				// �����������
	char IntToChar(int a);			// ��������ֵת�����ַ�ֵ
	int CharToSubscript(char ch);	// FEN�������Ӷ�Ӧ�������±�
		//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

	void AddPiece(int pos, int pc);			// ��posλ����������pc
	void StringToArray(const char *FenStr); // ��FEN����ʾ�ľ���ת����һά����
	void ArrayToString();					// ��һά�����ʾ�ľ���ת����FEN��

	// �߷�������غ���-----------------------------------
	int SaveMove(unsigned char from, unsigned char to,move * mv);//�������ɵ��߷�,�ɹ�����1��ʧ�ܷ���0
	int GenAllMove(move * MoveArray);	//�������е��߷�
	void OutputMove(move * MoveArray, int MoveNum);//������е��߷�
	int Check(int lSide);		//���lSideһ���Ƿ񱻽������Ǳ���������1�����򷵻�0
	int LegalMove(move mv);		//�ж��߷��Ƿ����
	int HasLegalMove();			//�жϵ�ǰ�����Ƿ��к����߷���û��������

	// �������� ------------------------------------------
	short Eval();				// ��������
	int IntToSubscript(int a);	// ��������ֵת�����±�
		//�±�0��1��2��3��4��5��6�ֱ��Ӧ��ʾ�����ˣ����������ڣ���

	// ��������------------------------------------------
	void ComputerThink();	//����˼��
	int AlphaBetaSearch(int depth, int alpha, int beta);	// Alpha-Beta�����㷨
	bool MakeMove(move m);	// ִ���߷�
	void UnMakeMove();		// �����߷�
	void ChangeSide();		// �������巽

};

#endif // !defined(AFX_BOARD_H__F6F321A6_8261_4448_A440_7B50D85B1BAB__INCLUDED_)
