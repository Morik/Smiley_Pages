<?php
require_once(WCF_DIR.'lib/data/message/smiley/Smiley.class.php');
require_once(WCF_DIR.'lib/page/AbstractPage.class.php');

/**
 * Outputs a xml document with a list of smileys.
 *
 * @author		Markus Bartz
 * @copyright	2011 Markus Bartz
 * @package		info.codingcorner.wcf.message.smileypage
 * @license		GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @subpackage	page
 * @category	Smiley Pages
 */
class SmileyAjaxPage extends AbstractPage {
	/**
	 * smiley category id
	 *
	 * @var	integer
	 */
	public $smileyCategoryID = 0;
	
	/**
	 * page of category
	 * 
	 * @var	integer
	 */
	public $page = 0;
	
	/**
	 * smileys per page
	 * 
	 * @var	integer
	 */
	public $smileysPerPage = SMILEYS_PER_PAGE;
	
	/**
	 * smileys
	 * 
	 * @var array<Smiley>
	 */
	
	/**
	 * @see Page::readParameters()
	 */
	public function readParameters() {
		parent::readParameters();
		
		if (isset($_POST['smileyCategoryID'])) $this->smileyCategoryID = intval($_POST['smileyCategoryID']);
		if (isset($_REQUEST['pageNo'])) $this->page = intval($_REQUEST['pageNo']);
		if ($this->page <= 0) $this->page = 1;
		
		if (WCF::getUser()->smileysPerPage && WCF::getUser()->smileysPerPage > 0) $this->smileysPerPage = WCF::getUser()->smileysPerPage;
	}
	
	/**
	 * @see Page::readData()
	 */
	public function readData() {
		parent::readData();
		
		$categories = WCF::getCache()->get('smileys', 'smileys');
		if (!isset($categories[$this->smileyCategoryID])) $this->smileyCategoryID = 0;
		
		$smileys = $categories[$this->smileyCategoryID];
		$maxPage = intval(ceil(count($smileys) / $this->smileysPerPage));
		if ($this->page > $maxPage) $this->page = $maxPage;
		
		$startSmiley = ($this->page - 1) * $this->smileysPerPage;
		$endSmiley = $this->page * $this->smileysPerPage;
		if ($endSmiley > count($smileys)) $endSmiley = count($smileys);
		for ($i = $startSmiley; $i < $endSmiley; $i++) {
			$this->smileys[] = $smileys[$i];
		}
	}
	
	/**
	 * @see Page::assignVariables()
	 */
	public function assignVariables() {
		parent::assignVariables();
		
		WCF::getTPL()->assign(array(
			'smileys' => $this->smileys,
			'smileyCategoryID' => $this->smileyCategoryID,
			'page' => $this->page,
		));
	}
	
	/**
	 * @see Page::show()
	 */
	public function show() {
		parent::show();
		
		header('Content-type: text/xml');
		header('Pragma: no-cache');
		header('Expires: 0');
		
		WCF::getTPL()->display('smileyAjax', false);
	}
}
?>