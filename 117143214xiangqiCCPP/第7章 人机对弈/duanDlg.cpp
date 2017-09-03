// duanDlg.cpp : implementation file
//

#include "stdafx.h"
#include "duan.h"
#include "duanDlg.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CAboutDlg dialog used for App About
#define BORDERWIDTH 13 //����(����)��Ե�Ŀ��
#define BORDERHEIGHT 15//����(����)��Ե�ĸ߶�
#define GRILLEWIDTH 35  //������ÿ�����ӵĸ߶�
#define GRILLEHEIGHT 35 //������ÿ�����ӵĿ��

#define RedTime 1
#define BlkTime 2
/////////////////////////////////////////////////////////////////////////////////

class CAboutDlg : public CDialog
{
public:
	CAboutDlg();

// Dialog Data
	//{{AFX_DATA(CAboutDlg)
	enum { IDD = IDD_ABOUTBOX };
	//}}AFX_DATA

	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CAboutDlg)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:
	//{{AFX_MSG(CAboutDlg)
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialog(CAboutDlg::IDD)
{
	//{{AFX_DATA_INIT(CAboutDlg)
	//}}AFX_DATA_INIT
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(CAboutDlg)
	//}}AFX_DATA_MAP
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialog)
	//{{AFX_MSG_MAP(CAboutDlg)
		// No message handlers
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CDuanDlg dialog

CDuanDlg::CDuanDlg(CWnd* pParent /*=NULL*/)
	: CDialog(CDuanDlg::IDD, pParent)
{
	//{{AFX_DATA_INIT(CDuanDlg)
		// NOTE: the ClassWizard will add member initialization here
	//}}AFX_DATA_INIT
	// Note that LoadIcon does not require a subsequent DestroyIcon in Win32
	m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
	m_SelectMoveFrom = NOMOVE;
	m_SelectMoveTo = NOMOVE;
}

void CDuanDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(CDuanDlg)
	DDX_Control(pDX, IDC_RED_TIMEPASS, m_RedTimePass_Ctr);
	DDX_Control(pDX, IDC_RED_TIMELEFT, m_RedTimeLeft_Ctr);
	DDX_Control(pDX, IDC_BLK_TIMEPASS, m_BlkTimePass_Ctr);
	DDX_Control(pDX, IDC_BLK_TIMELEFT, m_BlkTimeLeft_Ctr);
	DDX_Control(pDX, IDC_BUTTON_CLOSE, m_ButExit);
	DDX_Control(pDX, IDC_BUT_BEGIN, m_ButBegin);
	//}}AFX_DATA_MAP
}

BEGIN_MESSAGE_MAP(CDuanDlg, CDialog)
	//{{AFX_MSG_MAP(CDuanDlg)
	ON_WM_SYSCOMMAND()
	ON_WM_PAINT()
	ON_WM_QUERYDRAGICON()
	ON_BN_CLICKED(IDC_BUT_BEGIN, OnButBegin)
	ON_WM_LBUTTONDOWN()
	ON_COMMAND(IDM_LET_COMPUTERTHINK, OnLetComputerThink)
	ON_WM_TIMER()
	ON_BN_CLICKED(IDC_BUTTON_CLOSE, OnButtonClose)
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CDuanDlg message handlers

BOOL CDuanDlg::OnInitDialog()
{
	CDialog::OnInitDialog();

	// Add "About..." menu item to system menu.

	// IDM_ABOUTBOX must be in the system command range.
	ASSERT((IDM_ABOUTBOX & 0xFFF0) == IDM_ABOUTBOX);
	ASSERT(IDM_ABOUTBOX < 0xF000);

	CMenu* pSysMenu = GetSystemMenu(FALSE);
	if (pSysMenu != NULL)
	{
		CString strAboutMenu;
		strAboutMenu.LoadString(IDS_ABOUTBOX);
		if (!strAboutMenu.IsEmpty())
		{
			pSysMenu->AppendMenu(MF_SEPARATOR);
			pSysMenu->AppendMenu(MF_STRING, IDM_ABOUTBOX, strAboutMenu);
		}
	}

	// Set the icon for this dialog.  The framework does this automatically
	//  when the application's main window is not a dialog
	SetIcon(m_hIcon, TRUE);			// Set big icon
	SetIcon(m_hIcon, FALSE);		// Set small icon
	
	// TODO: Add extra initialization here
	BITMAP BitMap;
	m_BoardBmp.LoadBitmap(IDB_CHESSBOARD);
	m_BoardBmp.GetBitmap(&BitMap);
	m_nBoardWidth =  BitMap.bmWidth; 
	m_nBoardHeight = BitMap.bmHeight;
	m_BoardBmp.DeleteObject();

	m_Chessman.Create(IDB_CHESSMAN, 31, 15, RGB(0,128,128)); 

	rectBoard.left = BORDERWIDTH;
	rectBoard.right = BORDERWIDTH + GRILLEWIDTH*9;
	rectBoard.top = BORDERHEIGHT;
	rectBoard.bottom = BORDERHEIGHT + GRILLEHEIGHT*10;

	m_BlkTimeLeft_Ctr.SetWindowText("");
	m_BlkTimePass_Ctr.SetWindowText("");
	m_RedTimeLeft_Ctr.SetWindowText("");
	m_RedTimePass_Ctr.SetWindowText("");


	InitData();
	m_TotalTime = CTimeSpan(0,0,30,0);
	m_BlkTimer = 0;
	m_RedTimer = 0;

	return TRUE;  // return TRUE  unless you set the focus to a control
}

void CDuanDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
	if ((nID & 0xFFF0) == IDM_ABOUTBOX)
	{
		CAboutDlg dlgAbout;
		dlgAbout.DoModal();
	}
	else
	{
		CDialog::OnSysCommand(nID, lParam);
	}
}

// If you add a minimize button to your dialog, you will need the code below
//  to draw the icon.  For MFC applications using the document/view model,
//  this is automatically done for you by the framework.

void CDuanDlg::OnPaint() 
{
/*	if (IsIconic())
	{
		CPaintDC dc(this); // device context for painting

		SendMessage(WM_ICONERASEBKGND, (WPARAM) dc.GetSafeHdc(), 0);

		// Center icon in client rectangle
		int cxIcon = GetSystemMetrics(SM_CXICON);
		int cyIcon = GetSystemMetrics(SM_CYICON);
		CRect rect;
		GetClientRect(&rect);
		int x = (rect.Width() - cxIcon + 1) / 2;
		int y = (rect.Height() - cyIcon + 1) / 2;

		// Draw the icon
		dc.DrawIcon(x, y, m_hIcon);
	}
	else
	{
		CDialog::OnPaint();
	}
*/

	CPaintDC dc(this);
	CDC MemDC;
	POINT pt;
	CBitmap *pOldBmp;
	int z;
	
	MemDC.CreateCompatibleDC( &dc );
	m_BoardBmp.LoadBitmap(IDB_CHESSBOARD);
	pOldBmp = MemDC.SelectObject(&m_BoardBmp);
	for (short i=0; i<90; i++)
	{
		if (m_interface[i] == 0)
		{
			if(i == m_SelectMoveFrom)
			{
				pt.x = (i % 9)*GRILLEHEIGHT + BORDERWIDTH ;
				pt.y = (i / 9)*GRILLEWIDTH + BORDERHEIGHT;
				m_Chessman.Draw(&MemDC, 14, pt, ILD_TRANSPARENT);
			}
				continue;
		}
		pt.x = (i % 9)*GRILLEHEIGHT + BORDERWIDTH ;
		pt.y = (i / 9)*GRILLEWIDTH + BORDERHEIGHT;
		
		z = IntToSubscript(m_interface[i]);
		
		m_Chessman.Draw(&MemDC,z , pt, ILD_TRANSPARENT);
		if(i == m_SelectMoveFrom)
			m_Chessman.Draw(&MemDC, 14, pt, ILD_TRANSPARENT);
		if(i == m_SelectMoveTo)
			m_Chessman.Draw(&MemDC, 14, pt, ILD_TRANSPARENT);
	}

	dc.BitBlt(0, 0, m_nBoardWidth, m_nBoardHeight, &MemDC, 0, 0, SRCCOPY);
	MemDC.SelectObject(&pOldBmp);
	MemDC.DeleteDC();
	m_BoardBmp.DeleteObject();
}

// The system calls this to obtain the cursor to display while the user drags
//  the minimized window.
HCURSOR CDuanDlg::OnQueryDragIcon()
{
	return (HCURSOR) m_hIcon;
}

void CDuanDlg::OnButBegin() 
{
	// TODO: Add your control notification handler code here
	InitData();
	m_SelectMoveFrom = NOMOVE;
	m_SelectMoveTo = NOMOVE;
	InvalidateRect(&rectBoard, false);
	UpdateWindow();
	
	m_Board.ClearBoard();
	m_Board.StringToArray("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w");
	m_tsBlkTimeLeft = m_TotalTime;
	m_BlkTimeLeft_Ctr.SetWindowText(m_tsBlkTimeLeft.Format("%H:%M:%S"));
	m_tsBlkTimePass = m_TotalTime - m_tsBlkTimeLeft;
	m_BlkTimePass_Ctr.SetWindowText(m_tsBlkTimePass.Format("%H:%M:%S"));
	m_tsRedTimeLeft = m_tsBlkTimeLeft;
	m_RedTimeLeft_Ctr.SetWindowText(m_tsRedTimeLeft.Format("%H:%M:%S"));
	m_tsRedTimePass = m_TotalTime - m_tsRedTimeLeft;
	m_RedTimePass_Ctr.SetWindowText(m_tsRedTimePass.Format("%H:%M:%S"));

	m_RedTimer = SetTimer(1,1000,NULL);
	m_gameState = REDTHINKING;
}

BOOL CDuanDlg::IsPtInBoard(CPoint point)
{

	return rectBoard.PtInRect(point);
}

void CDuanDlg::OnLButtonDown(UINT nFlags, CPoint point) 
{
	// TODO: Add your message handler code here and/or call default
	if (!IsPtInBoard(point) || m_gameState!=REDTHINKING)
		return;

	int SideTag = 16 + m_HumanSide * 16;

	short dest,from;
	int num;
	
	//��ո�����ʾ
	from = m_SelectMoveFrom;
	dest = m_SelectMoveTo;
	m_SelectMoveTo = NOMOVE;
	m_SelectMoveFrom = NOMOVE;
	if(from != NOMOVE)
		RequireDrawCell(from);
	if(dest != NOMOVE)
		RequireDrawCell(dest);

	dest = GetPiecePos(point);

	BYTE piece = m_interface[dest];

	if (piece & SideTag) //ѡ��ѡ�б�������
	{
		if (from != NOMOVE) {	//��ʼ�Ѿ�ѡ���б�����������,��ȡ��������ʾԭ��ѡ�е�����
			m_SelectMoveFrom = NOMOVE;
			RequireDrawCell(from);
		}
		m_SelectMoveFrom = dest;	//������ʾ��ѡ�е�����
		RequireDrawCell(dest);
	}
	else //�������ڿմ�����������������
	if (from != NOMOVE)	//����Ѿ���ѡ�б�������
	{
		move mv;
		mv.from = ((from/9 +3) *16 + from%9 +3);	//��10*9������λ��ת����16*16������λ��
		mv.to = ((dest/9 +3) *16 + dest%9 +3);

		if (m_Board.LegalMove(mv)) //�߷������Լ��飬Դλ��z��Ŀ��λ��k
		{
			m_Board.MakeMove(mv);
			m_interface[dest] = m_interface[from];
			m_interface[from] = 0;

			m_SelectMoveTo = dest;
			RequireDrawCell(dest);
			m_SelectMoveFrom = from;	//������ʾ�߷���ʼ��
			RequireDrawCell(from);		//��Դ�㼰Ŀ�ĵ�������ʾ
			Beep(200,300);

			num = m_Board.HasLegalMove(); //�ж�ʤ��
			if (!num) {
				KillTimer(m_RedTimer);
				m_gameState = GAMEOVER;
				MessageBox("�췽��ʤ", "ϵͳ��Ϣ");
				return;
			}

			KillTimer(m_RedTimer);
			m_gameState = BLACKTHINKING;

			PostMessage(WM_COMMAND, IDM_LET_COMPUTERTHINK);
		}
	}
	
	CDialog::OnLButtonDown(nFlags, point);
}

short CDuanDlg::GetPiecePos(POINT pt)
{
	if (!rectBoard.PtInRect(pt)) return -1;
	short x = (pt.x-rectBoard.left) / GRILLEWIDTH;
	short y = (pt.y-rectBoard.top)  / GRILLEHEIGHT;

	return x + y * 9;

}

void CDuanDlg::RequireDrawCell(short pos)
{
	CRect rect = GetPieceRect(pos);
	InvalidateRect(&rect, false);
	UpdateWindow();
}

CRect CDuanDlg::GetPieceRect(short pos)
{
	short x = BORDERWIDTH + (pos % 9)*GRILLEWIDTH;
	short y = BORDERHEIGHT + (pos / 9)*GRILLEHEIGHT;
	CRect rect(x, y, x+GRILLEWIDTH, y+GRILLEHEIGHT);
	return rect;	

}

void CDuanDlg::OnLetComputerThink()
{
	if (m_gameState==GAMEOVER)
		return;
	CTime t1 = CTime::GetCurrentTime();

	m_Board.ComputerThink();

	m_tsBlkTimePass = m_tsBlkTimePass + (CTime::GetCurrentTime() - t1);
	if(m_tsBlkTimePass > m_TotalTime)
	{
		m_gameState = GAMEOVER;
		if(m_RedTimer)
			KillTimer(m_RedTimer);
		MessageBox("�ڷ���ʱ�и�", "ϵͳ��ʾ");
		return;
	}

	short z,k;
	z = m_Board.BestMove.from;
	k = m_Board.BestMove.to;

	if(z == 0)
	{
		m_gameState = GAMEOVER;
		if(m_RedTimer)
			KillTimer(m_RedTimer);
		MessageBox("�ڷ����䣬�췽��ʤ", "ϵͳ��ʾ");
		return;
	}

	int num;
	m_Board.MakeMove(m_Board.BestMove);
		
	short zz,kk;
	//��ո�����ʾ
	zz = m_SelectMoveFrom;
	kk = m_SelectMoveTo;
	m_SelectMoveFrom = NOMOVE;
	m_SelectMoveTo = NOMOVE;
	RequireDrawCell(zz); 
	RequireDrawCell(kk);

	zz = ((z/16 -3) *9 + z%16 -3);	//��16*16������λ��ת����10*9������λ��
	kk = ((k/16 -3) *9 + k%16 -3);

	m_interface[kk] = m_interface[zz];
	m_interface[zz] = 0;

	//������ʾ�����߷�
	m_SelectMoveFrom = zz;
	m_SelectMoveTo = kk;
	RequireDrawCell(zz); 
	RequireDrawCell(kk);
	Beep(500,300);

	m_tsBlkTimeLeft = m_TotalTime - m_tsBlkTimePass;
	m_BlkTimeLeft_Ctr.SetWindowText(m_tsBlkTimeLeft.Format("%H:%M:%S"));
	m_BlkTimePass_Ctr.SetWindowText(m_tsBlkTimePass.Format("%H:%M:%S"));

	num = m_Board.HasLegalMove(); //
	if (!num) {
		KillTimer(m_RedTimer);
		m_gameState = GAMEOVER;
		Beep(700,1000);
		MessageBox("�ڷ���ʤ", "ϵͳ��Ϣ");
		return;
	}

	m_gameState = REDTHINKING;
	m_RedTimer = SetTimer(1,1000,NULL);
}

void CDuanDlg::OnTimer(UINT nIDEvent) 
{
	// TODO: Add your message handler code here and/or call default
	switch(nIDEvent)
	{
	case 2:
		m_tsBlkTimePass =  m_tsBlkTimePass + CTimeSpan(0,0,0,1);
		m_tsBlkTimeLeft = m_TotalTime - m_tsBlkTimePass;
		m_BlkTimeLeft_Ctr.SetWindowText(m_tsBlkTimeLeft.Format("%H:%M:%S"));
		m_BlkTimePass_Ctr.SetWindowText(m_tsBlkTimePass.Format("%H:%M:%S"));
		break;
	case 1:
		m_tsRedTimePass =  m_tsRedTimePass + CTimeSpan(0,0,0,1);
		if(m_tsRedTimePass > m_TotalTime)
		{
			m_gameState = GAMEOVER;
			KillTimer(m_RedTimer);
			MessageBox("�췽��ʱ�и�", "ϵͳ��ʾ");
		}
		else
		{
			m_tsRedTimeLeft = m_TotalTime - m_tsRedTimePass;
			m_RedTimeLeft_Ctr.SetWindowText(m_tsRedTimeLeft.Format("%H:%M:%S"));
			m_RedTimePass_Ctr.SetWindowText(m_tsRedTimePass.Format("%H:%M:%S"));
		}
		break;
	default:
		break;
	}
	CDialog::OnTimer(nIDEvent);
}

void CDuanDlg::InitData()
{

	static BYTE board[BOARD_SIZE]= {
		39, 37, 35, 33, 32, 34, 36, 38, 40,
		0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 41, 0, 0, 0, 0, 0, 42, 0,
		43, 0, 44, 0, 45, 0, 46, 0, 47,
		0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0,
		27, 0, 28, 0, 29, 0, 30, 0, 31,
		0, 25, 0, 0, 0, 0, 0, 26, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0,
		23, 21, 19, 17, 16, 18, 20, 22, 24
	};

	for (int i=0; i<BOARD_SIZE; i++) 
	{
		m_interface[i] = board[i];
	}

	m_ComputerSide = 1; 
	m_HumanSide = 0;
	m_gameState = GAMEOVER;
}

int CDuanDlg::IntToSubscript(int a)
{
	if(a<16 && a>=48)
		return 14;
	
	switch(a)
	{
		//�췽����
	case 16:	return 0;
	case 17:
	case 18:	return 1;
	case 19:
	case 20:	return 2;
	case 21:
	case 22:	return 3;
	case 23:
	case 24:	return 4;
	case 25:
	case 26:	return 5;
	case 27:
	case 28:
	case 29:
	case 30:
	case 31:	return 6;

		//�ڷ�����
	case 32:	return 7;
	case 33:
	case 34:	return 8;
	case 35:
	case 36:	return 9;
	case 37:
	case 38:	return 10;
	case 39:
	case 40:	return 11;
	case 41:
	case 42:	return 12;
	case 43:
	case 44:
	case 45:
	case 46:
	case 47:	return 13;

	default:	return 14;
	}
}

void CDuanDlg::OnButtonClose() 
{
	// TODO: Add your control notification handler code here
	if(MessageBox("���Ҫ�˳���","ϵͳ��ʾ",MB_OKCANCEL)==IDOK)
	{
		DestroyWindow();
		delete this;
	}
}
