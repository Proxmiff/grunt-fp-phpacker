<?php
class TestClass {

	private $_testField;

	/**
	 * @param string $testField Test value for test field
	 */
	public function __construct($testField) {
		$this->_testField = $testField;
	}

	/**
	 * Returns value of test field
	 * @return string
	 */
	public function getTestField() {
		return $this->_testField;
	}

}