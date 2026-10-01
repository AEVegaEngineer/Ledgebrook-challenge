from ledgebrook_worker import SERVICE_NAME


def test_package_is_importable() -> None:
    assert SERVICE_NAME == "ledgebrook-worker"
