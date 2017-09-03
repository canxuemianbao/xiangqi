// duanDlg.h : header file
//

#if !defined(AFX_DUANDLG_H__BC9E6178_3857_4B19_A937_D0B32A100772__INCLUDED_)
#define AFX_DUANDLG_H__BC9E6178_3857_4B19_A937_D0B32A100772__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000

#include "def.h"
#include "Board.h"

#define	SIZE_X			9
#define	SIZE_Y			10
#define BOARD_SIZE		SIZE_X*SIZE_Y
#define NOMOVE				-1
#define EMPTY	7
#define BLACK	1
#define RED	0
//m_gameState������״̬
#define REDTHINKING		0
#define BLACKTHINKING	1
#define GAMEOVER			2
//�Զ�����Ϣ
#define IDM_LET_COMPUTERTHINK WM_USER +100

/////////////////////////////////////////////////////////////////////////////
// CDuanDlg dialog

class CDuanDlg : public CDialog
{
// Construction
public:
	int IntToSubscript(int a);//��������ֵת�����±��ʾ�����ڽ�����ʾ
				//����ֵ��0���췽��ʤ��1�ڷ���ʤ��-1δ��ʤ��
	void InitData();		//��ʼ������
	CRect GetPieceRect(short pos);		//����λ�ö�Ӧ�ľ�������
	void RequireDrawCell(short pos);	//�ػ������ϵ�һ��
	short GetPiecePos(POINT pt);	//�����Ӧ������λ��
	BOOL IsPtInBoard(CPoint point);	//�����Ƿ���������
	CDuanDlg(CWnd* pParent = NULL);	// standard constructor

// Dialog Data
	//{{AFX_DATA(CDuanDlg)
	enum { IDD = IDD_DUAN_DIALOG };
	CStatic	m_RedTimePass_Ctr;
	CStatic	m_RedTimeLeft_Ctr;
	CStatic	m_BlkTimePass_Ctr;
	CStatic	m_BlkTimeLeft_Ctr;
	CButton	m_ButExit;
	CButton	m_ButBegin;
	//}}AFX_DATA

	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CDuanDlg)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);	// DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:
	HICON m_hIcon;

	// Generated message map functions
	//{{AFX_MSG(CDuanDlg)
	virtual BOOL OnInitDialog();
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg HCURSOR OnQueryDragIcon();
	afx_msg void OnButBegin();
	afx_msg void OnLButtonDown(UINT nFlags, CPoint point);
	afx_msg void OnLetComputerThink();
	afx_msg void OnTimer(UINT nIDEvent);
	afx_msg void OnButtonClose();
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
private:
	CBitmap m_BoardBmp;		//����λͼ
	CImageList m_Chessman;	//����ͼ�б�
	int m_nBoardWidth, m_nBoardHeight;//����λͼ�Ŀ��


	//ʱ�������صı���
	CTimeSpan m_tsBlkTimeLeft,m_tsRedTimeLeft;
	CTimeSpan m_tsBlkTimePass,m_tsRedTimePass;
	CTimeSpan m_TotalTime;
	UINT m_BlkTimer,m_RedTimer;

	CBoard m_Board;

	//������ʾ���Ʊ���
	CRect	rectBoard;		//���̾��ο�
	short	m_SelectMoveFrom,m_SelectMoveTo;	//һ���߷�����ʼ�㣬���ڸ�����ʾ
	short	m_ComputerSide, m_HumanSide;
	BYTE	m_interface[BOARD_SIZE];//�������飬���������
	short	m_gameState;	//���״̬������/�췽/�ڷ�

};

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_DUANDLG_H__BC9E6178_3857_4B19_A937_D0B32A100772__INCLUDED_)
